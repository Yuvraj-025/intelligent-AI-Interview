import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { InterviewRedisService } from './interview-redis.service';

@Module({
  controllers: [InterviewController],
  providers: [InterviewService, InterviewRedisService],
})
export class AppModule {}
