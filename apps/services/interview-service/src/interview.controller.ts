import { Controller, Post, Body, Get, Param, Headers } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { CreateSessionDto, InterviewRole, InterviewMode, Difficulty } from '@voxhire/shared-types';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('sessions')
  async createSession(
    @Body() body: { role: string; mode: string; difficulty?: string; userId?: string },
    @Headers('authorization') token: string,
  ) {
    // In production, extract userId from JWT. For now, pass from header.
    // The API Gateway should decode the JWT and pass userId.
    const userId = body.userId || 'temp-user-id';
    
    // Convert string values to enum values
    const dto: CreateSessionDto = {
      role: body.role as InterviewRole,
      mode: body.mode as InterviewMode,
      difficulty: body.difficulty as Difficulty | undefined
    };
    
    const result = await this.interviewService.createSession(userId, dto);
    return { success: true, data: result };
  }

  @Get('sessions/:id')
  async getSession(@Param('id') id: string) {
    const session = await this.interviewService.getSession(id);
    return { success: true, data: session };
  }

  @Post('sessions/:id/answer')
  async submitAnswer(
    @Param('id') sessionId: string,
    @Body() body: { questionId: string; transcript: string; audioUrl?: string; durationSeconds?: number },
  ) {
    const result = await this.interviewService.processAnswer(
      sessionId,
      body.questionId,
      body.transcript,
      body.audioUrl,
      body.durationSeconds,
    );
    return { success: true, data: result };
  }

  @Post('sessions/:id/complete')
  async completeSession(@Param('id') sessionId: string) {
    const session = await this.interviewService.completeSession(sessionId);
    return { success: true, data: session };
  }
}
