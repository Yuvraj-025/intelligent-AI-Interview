import { Controller, Post, Body, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: { name: string; email: string; password: string }) {
    const result = await this.authService.signup(body.name, body.email, body.password);
    return { success: true, data: result };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const result = await this.authService.login(body.email, body.password);
    return { success: true, data: result };
  }

  @Post('google')
  async googleLogin(@Body() body: { idToken: string }) {
    const result = await this.authService.googleLogin(body.idToken);
    return { success: true, data: result };
  }

  @Get('profile')
  async profile(@Headers('authorization') token: string) {
    const user = await this.authService.getProfile(token);
    return { success: true, data: user };
  }
}
