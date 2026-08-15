"""Database and config backup utilities for buildecogroup.com."""
import json
import os
import shutil
import subprocess
import tarfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse

import rbac

WORKSPACE = Path(__file__).resolve().parents[1]
BACKUP_ROOT = Path(os.environ.get("BACKUP_DIR", WORKSPACE / "backups")).resolve()
MANIFEST = BACKUP_ROOT / "manifest.json"

admin_router = APIRouter(prefix="/api/admin/backup", tags=["backup"])


def _now_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")


def _load_manifest() -> list:
    if MANIFEST.exists():
        try:
            return json.loads(MANIFEST.read_text())
        except json.JSONDecodeError:
            return []
    return []


def _save_manifest(entries: list) -> None:
    BACKUP_ROOT.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(entries, indent=2))


def _mongo_uri() -> str:
    return os.environ.get("MONGO_URL", "mongodb://127.0.0.1:27017")


def _db_name() -> str:
    return os.environ.get("DB_NAME", "test_database")


def run_backup(label: Optional[str] = None) -> dict:
    """Create mongodump + config archive. Returns backup metadata."""
    stamp = _now_stamp()
    name = f"dump_{stamp}" if not label else f"{label}_{stamp}"
    dump_dir = BACKUP_ROOT / name
    archive_path = BACKUP_ROOT / f"{name}.tar.gz"
    BACKUP_ROOT.mkdir(parents=True, exist_ok=True)

    if dump_dir.exists():
        shutil.rmtree(dump_dir)

    cmd = [
        "mongodump",
        f"--uri={_mongo_uri()}",
        f"--db={_db_name()}",
        f"--out={dump_dir}",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or proc.stdout or "mongodump failed")

    # Snapshot non-secret config templates
    config_dir = dump_dir / "_config"
    config_dir.mkdir(exist_ok=True)
    for rel in ("backend/.env", "frontend/.env"):
        src = WORKSPACE / rel
        if src.exists():
            shutil.copy2(src, config_dir / Path(rel).name)

    meta = {
        "id": name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "database": _db_name(),
        "dump_path": str(dump_dir.relative_to(BACKUP_ROOT)),
        "archive": archive_path.name,
        "collections": len(list((dump_dir / _db_name()).glob("*.bson"))) if (dump_dir / _db_name()).exists() else 0,
        "size_bytes": 0,
    }

    with tarfile.open(archive_path, "w:gz") as tar:
        tar.add(dump_dir, arcname=name)

    meta["size_bytes"] = archive_path.stat().st_size
    entries = _load_manifest()
    entries.insert(0, meta)
    _save_manifest(entries[:50])
    return meta


def run_restore(backup_id: str) -> dict:
    """Restore database from a named backup folder or archive."""
    dump_dir = BACKUP_ROOT / backup_id
    archive = BACKUP_ROOT / f"{backup_id}.tar.gz"

    if not dump_dir.exists() and archive.exists():
        with tarfile.open(archive, "r:gz") as tar:
            tar.extractall(BACKUP_ROOT)
        dump_dir = BACKUP_ROOT / backup_id

    db_path = dump_dir / _db_name()
    if not db_path.exists():
        raise FileNotFoundError(f"Backup {backup_id} not found or invalid")

    cmd = [
        "mongorestore",
        f"--uri={_mongo_uri()}",
        f"--db={_db_name()}",
        "--drop",
        str(db_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or proc.stdout or "mongorestore failed")
    return {"restored": backup_id, "database": _db_name()}


@admin_router.post("/create")
async def create_backup(request: Request, user=Depends(rbac.rbac_super_admin)):
    try:
        meta = run_backup()
    except Exception as exc:
        raise HTTPException(500, f"Backup failed: {exc}") from exc
    await rbac.audit_log("CREATE", "backup", meta["id"], None, meta, user=user, request=request)
    return {"ok": True, "backup": meta}


@admin_router.get("/list")
async def list_backups(user=Depends(rbac.rbac_super_admin)):
    entries = _load_manifest()
    # Also scan disk for untracked dumps
    known = {e["id"] for e in entries}
    for p in sorted(BACKUP_ROOT.glob("dump_*"), reverse=True):
        if p.is_dir() and p.name not in known:
            entries.append({
                "id": p.name,
                "created_at": datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc).isoformat(),
                "database": _db_name(),
                "dump_path": p.name,
                "archive": f"{p.name}.tar.gz" if (BACKUP_ROOT / f"{p.name}.tar.gz").exists() else None,
                "collections": len(list((p / _db_name()).glob("*.bson"))) if (p / _db_name()).exists() else 0,
                "size_bytes": (BACKUP_ROOT / f"{p.name}.tar.gz").stat().st_size if (BACKUP_ROOT / f"{p.name}.tar.gz").exists() else 0,
                "untracked": True,
            })
    return {"backups": entries, "backup_dir": str(BACKUP_ROOT)}


@admin_router.get("/download/{backup_id}")
async def download_backup(backup_id: str, user=Depends(rbac.rbac_super_admin)):
    if ".." in backup_id or "/" in backup_id:
        raise HTTPException(400, "Invalid backup id")
    archive = BACKUP_ROOT / f"{backup_id}.tar.gz"
    if not archive.exists():
        raise HTTPException(404, "Archive not found. Create a backup first.")
    return FileResponse(archive, filename=archive.name, media_type="application/gzip")


@admin_router.post("/restore/{backup_id}")
async def restore_backup(backup_id: str, request: Request, user=Depends(rbac.rbac_super_admin)):
    if ".." in backup_id or "/" in backup_id:
        raise HTTPException(400, "Invalid backup id")
    try:
        result = run_restore(backup_id)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(500, f"Restore failed: {exc}") from exc
    await rbac.audit_log("RESTORE", "backup", backup_id, None, result, user=user, request=request)
    return {"ok": True, **result}
