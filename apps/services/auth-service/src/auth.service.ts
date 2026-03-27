import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@voxhire/db';
import { getConfig } from '@voxhire/config';
import { RedisService } from './redis.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
  ) {
    const config = getConfig();
    this.googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);
  }

  // ─── Email/Password Auth ─────────────────────────

  async signup(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, authProvider: 'local' },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
    });

    const token = this.jwt.sign({ sub: user.id, email: user.email });
    await this.redis.cacheUserSession(user.id, { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl });

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // If user signed up via Google, they don't have a password
    if (!user.passwordHash) {
      throw new UnauthorizedException('This account uses Google sign-in. Please use the Google button.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign({ sub: user.id, email: user.email });
    await this.redis.cacheUserSession(user.id, { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl });

    return {
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, createdAt: user.createdAt },
      token,
    };
  }

  // ─── Google OAuth ────────────────────────────────

  async googleLogin(idToken: string) {
    // Verify the Google ID token
    const config = getConfig();
    let payload: any;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: config.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google token payload');
    }

    const { email, name, sub: googleId, picture } = payload;

    // Try to find existing user by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email },
        ],
      },
    });

    if (user) {
      // Update Google info if needed (link account)
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatarUrl: picture || user.avatarUrl,
            authProvider: user.passwordHash ? 'local' : 'google', // Keep 'local' if they also have a password
          },
        });
      }
    } else {
      // Create new user via Google
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          googleId,
          avatarUrl: picture,
          authProvider: 'google',
        },
      });
    }

    const token = this.jwt.sign({ sub: user.id, email: user.email });
    await this.redis.cacheUserSession(user.id, {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  // ─── Profile ─────────────────────────────────────

  async getProfile(token: string) {
    try {
      const payload = this.jwt.verify(token.replace('Bearer ', ''));
      const userId = payload.sub;

      const cached = await this.redis.getCachedSession(userId);
      if (cached) return cached;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
      });

      if (user) {
        await this.redis.cacheUserSession(userId, user as unknown as Record<string, unknown>);
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
