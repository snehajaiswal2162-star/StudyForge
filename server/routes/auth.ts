import { Router, Request, Response } from 'express';
import { userStore } from '../store/userStore';

export const authRouter = Router();

function createSessionToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, issuedAt: Date.now() })).toString('base64url');
  return `sf-session.${payload}`;
}

function getUserIdFromSessionToken(authHeader: string): string | null {
  const [scheme, token] = authHeader.trim().split(/\s+/, 2);
  if (scheme !== 'Bearer' || !token) return null;

  const [prefix, payload] = token.split('.', 2);
  if (prefix !== 'sf-session' || !payload) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { userId?: unknown };
    return typeof decoded.userId === 'string' && decoded.userId.length > 0 ? decoded.userId : null;
  } catch {
    return null;
  }
}

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = userStore.findByEmail(email);
  if (!user || !userStore.verifyPassword(user, password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      ...(user.planId ? { planId: user.planId } : {}),
    },
    token: createSessionToken(user.id),
  });
});

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const result = userStore.createUser(name, email, password);
  if (result.error || !result.user) {
    return res.status(400).json({ error: result.error || 'Failed to create account.' });
  }

  return res.status(201).json({
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      ...(result.user.planId ? { planId: result.user.planId } : {}),
    },
    token: createSessionToken(result.user.id),
  });
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header.' });
  }

  const userId = getUserIdFromSessionToken(authHeader);
  const user = userId ? userStore.findById(userId) : undefined;

  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid user.' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      ...(user.planId ? { planId: user.planId } : {}),
    },
  });
});
