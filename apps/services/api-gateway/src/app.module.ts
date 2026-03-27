import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health.controller';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [
    // Rate limiting: 100 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ProxyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
