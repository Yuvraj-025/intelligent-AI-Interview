import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execFileAsync = promisify(execFile);

/**
 * STT Service using local Whisper.
 * Whisper runs as a Python sidecar — transcribes audio to text.
 *
 * Install: pip install openai-whisper
 *
 * For faster inference: pip install faster-whisper
 */
@Injectable()
export class SttService {
  /**
   * Transcribe audio buffer to text using Whisper.
   * Accepts audio as a Buffer (from file upload).
   */
  async transcribe(audioBuffer: Buffer, format = 'webm'): Promise<string> {
    const tmpDir = os.tmpdir();
    const inputFile = path.join(tmpDir, `voxhire-stt-${Date.now()}.${format}`);

    try {
      // Write audio buffer to temp file
      fs.writeFileSync(inputFile, audioBuffer);

      // Run Whisper CLI
      const { stdout } = await execFileAsync('whisper', [
        inputFile,
        '--model', 'base',
        '--output_format', 'txt',
        '--output_dir', tmpDir,
        '--language', 'en',
      ], { timeout: 120000 }); // 2 minute timeout

      // Read the transcript file
      const txtFile = inputFile.replace(`.${format}`, '.txt');
      let transcript = '';

      if (fs.existsSync(txtFile)) {
        transcript = fs.readFileSync(txtFile, 'utf-8').trim();
        fs.unlinkSync(txtFile);
      } else {
        // Try to extract from stdout
        transcript = stdout.trim();
      }

      // Clean up
      if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

      return transcript || 'Unable to transcribe audio.';
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
      console.error('Whisper transcription failed:', error);
      throw new Error('Transcription failed. Ensure Whisper is installed: pip install openai-whisper');
    }
  }
}
