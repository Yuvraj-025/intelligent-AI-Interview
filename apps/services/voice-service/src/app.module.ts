import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { TtsService } from './tts.service';
import { SttService } from './stt.service';
import { VoiceCacheService } from './voice-cache.service';

@Module({
  controllers: [VoiceController],
  providers: [TtsService, SttService, VoiceCacheService],
})
export class AppModule {}
