import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ReportGeneratorService } from './report-generator.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ReportGeneratorService],
})
export class AppModule {}
