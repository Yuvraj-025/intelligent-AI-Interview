import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ScoringService } from './scoring.service';

@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post('evaluate')
  async evaluate(@Body() body: {
    question: string;
    answer: string;
    role: string;
    topic: string;
    difficulty: string;
  }) {
    const result = await this.scoringService.evaluateResponse(body as any);
    return { success: true, data: result };
  }

  @Get('sessions/:id/scores')
  async getSessionScores(@Param('id') sessionId: string) {
    const scores = await this.scoringService.getSessionScores(sessionId);
    return { success: true, data: scores };
  }

  @Get('sessions/:id/aggregates')
  async getAggregates(@Param('id') sessionId: string) {
    const aggregates = await this.scoringService.computeAggregates(sessionId);
    return { success: true, data: aggregates };
  }
}
