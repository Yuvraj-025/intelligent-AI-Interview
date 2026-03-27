import { Controller, Post, Body, Get, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TtsService } from './tts.service';
import { SttService } from './stt.service';

@Controller('voice')
export class VoiceController {
  constructor(
    private readonly tts: TtsService,
    private readonly stt: SttService,
  ) {}

  /** Generate speech audio from question text */
  @Post('synthesize')
  async synthesize(@Body() body: { text: string; voice?: string }) {
    const audioBase64 = await this.tts.synthesize(body.text, body.voice);
    return {
      success: true,
      data: {
        audio: audioBase64,
        format: 'mp3',
        encoding: 'base64',
      },
    };
  }

  /** Transcribe uploaded audio to text */
  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribe(@UploadedFile() file: Express.Multer.File) {
    const transcript = await this.stt.transcribe(file.buffer, 'webm');
    return {
      success: true,
      data: { transcript },
    };
  }

  /** List available TTS voices */
  @Get('voices')
  async listVoices() {
    const voices = await this.tts.listVoices();
    return { success: true, data: voices };
  }
}
