import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { getConfig } from '@voxhire/config';

/**
 * Local filesystem storage service.
 * For MVP, stores files locally. Can be swapped to MinIO/S3 later.
 */
@Injectable()
export class StorageService {
  private basePath: string;

  constructor() {
    const config = getConfig();
    this.basePath = path.resolve(config.STORAGE_PATH);
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const dirs = ['audio', 'reports', 'transcripts'];
    for (const dir of dirs) {
      const fullPath = path.join(this.basePath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  /** Save audio file */
  async saveAudio(sessionId: string, buffer: Buffer, format = 'webm'): Promise<string> {
    const filename = `${sessionId}-${Date.now()}.${format}`;
    const filePath = path.join(this.basePath, 'audio', filename);
    fs.writeFileSync(filePath, buffer);
    return `/storage/audio/${filename}`;
  }

  /** Save report as JSON */
  async saveReport(sessionId: string, report: unknown): Promise<string> {
    const filename = `${sessionId}-report.json`;
    const filePath = path.join(this.basePath, 'reports', filename);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    return `/storage/reports/${filename}`;
  }

  /** Get file by path */
  async getFile(relativePath: string): Promise<Buffer | null> {
    const fullPath = path.join(this.basePath, relativePath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath);
  }

  /** Delete file by path */
  async deleteFile(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, relativePath);
    if (!fs.existsSync(fullPath)) return false;
    fs.unlinkSync(fullPath);
    return true;
  }
}
