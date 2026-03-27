import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request } from 'express';

@Controller('auth')
export class AuthProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post('signup')
  async signup(@Body() body: unknown) {
    return this.proxy.forward('auth-service', 'POST', '/auth/signup', body);
  }

  @Post('login')
  async login(@Body() body: unknown) {
    return this.proxy.forward('auth-service', 'POST', '/auth/login', body);
  }

  @Post('google')
  async googleLogin(@Body() body: unknown) {
    return this.proxy.forward('auth-service', 'POST', '/auth/google', body);
  }

  @Get('profile')
  async profile(@Req() req: Request) {
    const token = req.headers.authorization;
    return this.proxy.forward('auth-service', 'GET', '/auth/profile', undefined, {
      authorization: token || '',
    });
  }
}
