import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { VoiceCacheService } from './voice-cache.service';

const execFileAsync = promisify(execFile);

/**
 * TTS Service using edge-tts (Python package).
 * edge-tts uses Microsoft Edge's free cloud TTS — excellent quality, zero cost.
 * 
 * Install: pip install edge-tts
 * 
 * Falls back to a simple message if edge-tts is not available.
 */
@Injectable()
export class TtsService {
  constructor(private readonly cache: VoiceCacheService) {}

  /**
   * Convert text to speech audio (MP3 format).
   * Returns base64-encoded audio string.
   */
  async synthesize(text: string, voice = 'en-US-GuyNeural'): Promise<string> {
    // Check cache first
    const cacheKey = this.cache.hashText(`${voice}:${text}`);
    const cached = await this.cache.getCachedTtsAudio(cacheKey);
    if (cached) {
      console.log('🎯 TTS cache hit');
      return cached;
    }

    try {
      const audioBase64 = await this.generateWithEdgeTts(text, voice);
      // Cache the result
      await this.cache.cacheTtsAudio(cacheKey, audioBase64);
      return audioBase64;
    } catch (error) {
      console.error('edge-tts failed, returning empty audio:', error);
      throw new Error('TTS generation failed. Ensure edge-tts is installed: pip install edge-tts');
    }
  }

  private async generateWithEdgeTts(text: string, voice: string): Promise<string> {
    const tmpDir = os.tmpdir();
    const outputFile = path.join(tmpDir, `voxhire-tts-${Date.now()}.mp3`);

    try {
      // Call edge-tts via Python
      await execFileAsync('edge-tts', [
        '--voice', voice,
        '--text', text,
        '--write-media', outputFile,
      ], { timeout: 30000 });

      // Read the generated audio file
      const audioBuffer = fs.readFileSync(outputFile);
      const audioBase64 = audioBuffer.toString('base64');

      // Clean up temp file
      fs.unlinkSync(outputFile);

      return audioBase64;
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
      throw error;
    }
  }

  /** List available voices */
  async listVoices(): Promise<string[]> {
    try {
      const { stdout } = await execFileAsync('edge-tts', ['--list-voices'], { timeout: 10000 });
      const voices = stdout.split('\n')
        .filter((line: string) => line.includes('Name:'))
        .map((line: string) => line.replace('Name: ', '').trim());
      return voices;
    } catch {
      return ['en-US-GuyNeural', 'en-US-JennyNeural', 'en-US-AriaNeural'];
    }
  }
}
