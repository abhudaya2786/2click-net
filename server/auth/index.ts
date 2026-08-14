/**
 * Auth HTTP helpers — signup / signin / me / signout.
 */
import type { Express, Request, Response } from 'express';
import { authStore, readBearerToken } from './store.ts';

export function registerAuthRoutes(app: Express) {
  app.post('/api/v1/auth/signup', async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const result = await authStore.signup({
        userId: body.userId || body.user_id || body.username,
        password: body.password,
        displayName: body.displayName || body.display_name || body.name,
      });
      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (e: any) {
      res.status(e.status || 500).json({ error: e.message || 'Signup failed' });
    }
  });

  app.post('/api/v1/auth/signin', async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const result = await authStore.signin({
        userId: body.userId || body.user_id || body.username,
        password: body.password,
      });
      res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (e: any) {
      res.status(e.status || 500).json({ error: e.message || 'Sign in failed' });
    }
  });

  app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
    // Alias for signin
    try {
      const body = req.body || {};
      const result = await authStore.signin({
        userId: body.userId || body.user_id || body.username,
        password: body.password,
      });
      res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (e: any) {
      res.status(e.status || 500).json({ error: e.message || 'Login failed' });
    }
  });

  app.get('/api/v1/auth/me', async (req: Request, res: Response) => {
    try {
      const token = readBearerToken(req);
      const user = await authStore.getUserForToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Not signed in' });
      }
      res.json({ success: true, user });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to load session' });
    }
  });

  app.post('/api/v1/auth/signout', async (req: Request, res: Response) => {
    try {
      const token = readBearerToken(req);
      await authStore.signout(token);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Sign out failed' });
    }
  });
}

export { authStore, readBearerToken };
