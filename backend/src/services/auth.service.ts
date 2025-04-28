import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, authTokens, NewAuthToken, User } from '../db/schema';
import { sendMagicLink } from '../utils/mail';
import { eq, and, isNull, gt } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '7d'; 
const MAGIC_LINK_EXPIRY = 10 * 60 * 1000; 

export async function createMagicLink(email: string): Promise<boolean> {
  try {
    let user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      const [newUser] = await db.insert(users).values({
        email,
      }).returning();
      
      user = newUser;
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY);
    
    const newToken: NewAuthToken = {
      userId: user.id,
      token,
      expiresAt,
    };
    
    await db.insert(authTokens).values(newToken);

    await sendMagicLink(email, token);
    
    return true;
  } catch (error) {
    console.error('Failed to request magic link:', error);
    return false;
  }
}

export async function verifyMagicLink(token: string): Promise<{ token: string, user: User } | null> {
  try {
    const authToken = await db.query.authTokens.findFirst({
      where: and(
        eq(authTokens.token, token),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date())
      ),
      with: {
        user: true
      }
    });

    if (!authToken) {
      return null;
    }

    await db.update(authTokens)
      .set({ usedAt: new Date() })
      .where(eq(authTokens.id, authToken.id));

    const jwtToken = jwt.sign(
      { userId: authToken.userId },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    const user = await db.query.users.findFirst({
      where: eq(users.id, authToken.userId)
    });

    if (!user) {
      return null;
    }

    return { token: jwtToken, user };
  } catch (error) {
    console.error('Failed to verify magic link:', error);
    return null;
  }
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    });
    
    return user || null;
  } catch (error) {
    console.error('Failed to verify token:', error);
    return null;
  }
} 