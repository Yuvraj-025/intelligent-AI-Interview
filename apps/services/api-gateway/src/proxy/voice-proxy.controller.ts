import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request } from 'express';

@Controller('voice')
export class VoiceProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post('synthesize')
  async synthesize(@Body() body: unknown, @Req() req: Request) {
    const token = req.headers.authorization;
    return this.proxy.forward('voice-service', 'POST', '/voice/synthesize', body, {
      authorization: token || '',
    });
  }

  @Post('transcribe')
  async transcribe(@Req() req: Request) {
    // For file uploads, we need to forward the raw request
    // For MVP, forward body as-is (the voice service handles multer)
    const token = req.headers.authorization;
    return this.proxy.forward('voice-service', 'POST', '/voice/transcribe', req.body, {
      authorization: token || '',
      'content-type': req.headers['content-type'] || '',
    });
  }

  @Get('voices')
  async listVoices(@Req() req: Request) {
    const token = req.headers.authorization;
    return this.proxy.forward('voice-service', 'GET', '/voice/voices', undefined, {
      authorization: token || '',
    });
  }
}
