import { Controller, Post, Get, Param, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request } from 'express';

@Controller('analytics')
export class AnalyticsProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get('sessions/:id/report')
  async getReport(@Param('id') id: string, @Req() req: Request) {
    const token = req.headers.authorization;
    return this.proxy.forward('analytics-service', 'GET', `/analytics/sessions/${id}/report`, undefined, {
      authorization: token || '',
    });
  }

  @Post('sessions/:id/generate-report')
  async generateReport(@Param('id') id: string, @Req() req: Request) {
    const token = req.headers.authorization;
    return this.proxy.forward('analytics-service', 'POST', `/analytics/sessions/${id}/generate-report`, undefined, {
      authorization: token || '',
    });
  }

  @Get('users/:userId/sessions')
  async getUserSessions(@Param('userId') userId: string, @Req() req: Request) {
    const token = req.headers.authorization;
    return this.proxy.forward('analytics-service', 'GET', `/analytics/users/${userId}/sessions`, undefined, {
      authorization: token || '',
    });
  }
}
