/**
 * Entry used only by `esbuild` to produce `api/index.js` for Vercel.
 * Keeps the Express app as a single serverless function without shipping raw .ts imports.
 */
import app from '../server.ts';
export default app;
