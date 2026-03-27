import { Controller, Get, Post, Param, Headers } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ReportGeneratorService } from './report-generator.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly reportGenerator: ReportGeneratorService,
  ) {}

  @Get('sessions/:id/report')
  async getReport(@Param('id') sessionId: string) {
    const analytics = await this.analytics.getSessionAnalytics(sessionId);
    return { success: true, data: analytics };
  }

  @Post('sessions/:id/generate-report')
  async generateReport(@Param('id') sessionId: string) {
    const result = await this.reportGenerator.generateReport(sessionId);
    return { success: true, data: result };
  }

  @Get('users/:userId/sessions')
  async getUserSessions(@Param('userId') userId: string) {
    const sessions = await this.analytics.getUserSessions(userId);
    return { success: true, data: sessions };
  }
}
