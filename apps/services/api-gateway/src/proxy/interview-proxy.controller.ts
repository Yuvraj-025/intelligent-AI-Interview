import { Controller, Post, Body, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request } from 'express';

/** Decode JWT payload without verifying (gateway trusts the token; auth-service validates on sensitive ops) */
function decodeJwtPayload(token: string): { sub?: string; email?: string } | null {
  try {
    const bare = token.replace(/^Bearer\s+/i, '');
    const payloadB64 = bare.split('.')[1];
    if (!payloadB64) return null;
    const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

@Controller('interview')
export class InterviewProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post('sessions')
  async createSession(@Body() body: any, @Req() req: Request) {
    const token = req.headers.authorization;
    if (!token) throw new UnauthorizedException('Authorization token required');

    const payload = decodeJwtPayload(token);
    if (!payload?.sub) throw new UnauthorizedException('Invalid token — no user ID');

    // Inject the real userId so interview-service can create the session correctly
    const enrichedBody = { ...body, userId: payload.sub };

    return this.proxy.forward('interview-service', 'POST', '/interview/sessions', enrichedBody, {
      authorization: token,
    });
  }

  @Get('sessions/:id')
  async getSession(@Param('id') id: string, @Req() req: Request) {
    const token = req.headers.authorization;
    return this.proxy.forward('interview-service', 'GET', `/interview/sessions/${id}`, undefined, {
      authorization: token || '',
    });
  }

  @Post('sessions/:id/answer')
  async submitAnswer(@Param('id') id: string, @Body() body: unknown, @Req() req: Request) {
    const token = req.headers.authorization;
    return this.proxy.forward('interview-service', 'POST', `/interview/sessions/${id}/answer`, body, {
      authorization: token || '',
    });
  }

  @Post('sessions/:id/complete')
  async completeSession(@Param('id') id: string, @Req() req: Request) {
    const token = req.headers.authorization;
    return this.proxy.forward('interview-service', 'POST', `/interview/sessions/${id}/complete`, undefined, {
      authorization: token || '',
    });
  }

  @Get('sessions/:id/report')
  async getReport(@Param('id') id: string, @Req() req: Request) {
    const token = req.headers.authorization;
    return this.proxy.forward('analytics-service', 'GET', `/analytics/sessions/${id}/report`, undefined, {
      authorization: token || '',
    });
  }
}
