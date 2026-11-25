import type { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { verifyMessage } from 'ethers';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/queries.ts';

export const OWNER_ADMIN_EMAIL = (
  process.env.TATASWAP_ADMIN_EMAIL || 'dinobandhu8158@gmail.com'
)
  .trim()
  .toLowerCase();

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing Firebase Bearer token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    if (decodedToken.uid && decodedToken.email) {
      await getOrCreateUser(decodedToken.uid, decodedToken.email);
    }
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired Firebase token' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  await requireAuth(req, res, () => {
    const email = req.user?.email?.trim().toLowerCase();
    const emailVerified = req.user?.email_verified === true;
    if (!email || !emailVerified || email !== OWNER_ADMIN_EMAIL) {
      res.status(403).json({
        error: `Forbidden: Admin access is locked to ${OWNER_ADMIN_EMAIL}.`,
      });
      return;
    }
    next();
  });
};

export function verifyWalletSignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const recovered = verifyMessage(message, signature);
    return recovered.toLowerCase() === expectedAddress.toLowerCase();
  } catch {
    return false;
  }
}
