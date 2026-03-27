import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request } from 'express';

@Controller('interview')
export class InterviewProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post('sessions')
  async createSession(@Body() body: unknown, @Req() req: Request) {
    const token = req.headers.authorization;
    return this.proxy.forward('interview-service', 'POST', '/interview/sessions', body, {
      authorization: token || '',
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
