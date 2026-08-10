# Data backup guide

## Automatic (recommended)

1. **Admin panel:** Dashboard → Administration → **Data Backup** → Create backup now
2. **API:** `POST /api/admin/backup/create` (super_admin JWT)
3. **Cron (daily 2 AM example):**
   ```cron
   0 2 * * * cd /path/to/2click-net && ./scripts/backup.sh >> /var/log/2click-backup.log 2>&1
   ```

## What is backed up

- Full MongoDB database (`mongodump`)
- `backend/.env` and `frontend/.env` snapshots (inside dump `_config/`)
- Compressed `.tar.gz` archive in `backups/`
- Manifest at `backups/manifest.json`

## Restore

```bash
./scripts/restore-backup.sh dump_20260810_133410
```

Or API: `POST /api/admin/backup/restore/{backup_id}` (super_admin only).

## Off-site safety

Copy `backups/*.tar.gz` to:

- Google Drive / S3 / another server
- GitHub Actions artifact (optional workflow on schedule)

Never rely on a single server disk.

## Environment

| Variable | Default |
|----------|---------|
| `BACKUP_DIR` | `./backups` |
| `MONGO_URL` | from `backend/.env` |
| `DB_NAME` | `test_database` |
