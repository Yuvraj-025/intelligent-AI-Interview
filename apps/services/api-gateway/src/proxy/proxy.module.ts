import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { AuthProxyController } from './auth-proxy.controller';
import { InterviewProxyController } from './interview-proxy.controller';
import { VoiceProxyController } from './voice-proxy.controller';
import { AnalyticsProxyController } from './analytics-proxy.controller';

@Module({
  controllers: [
    AuthProxyController,
    InterviewProxyController,
    VoiceProxyController,
    AnalyticsProxyController,
  ],
  providers: [ProxyService],
})
export class ProxyModule {}
