/**
 * Writable data directories for file-backed stores.
 * On Vercel/Lambda the deployment FS is read-only — use /tmp (ephemeral).
 */
import path from 'path';

function isServerlessReadonlyFs(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT,
  );
}

/** Base dir for app JSON stores (auth, company, etc.). */
export function resolveAppDataDir(...parts: string[]): string {
  const override = String(process.env.DATA_DIR || '').trim();
  if (override) return path.join(path.resolve(override), ...parts);

  if (isServerlessReadonlyFs()) {
    return path.join('/tmp', '2click-data', ...parts);
  }

  return path.join(process.cwd(), 'data', ...parts);
}

export function isEphemeralDataStore(): boolean {
  if (String(process.env.DATA_DIR || '').trim()) return false;
  return isServerlessReadonlyFs();
}
