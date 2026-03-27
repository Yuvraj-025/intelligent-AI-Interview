import { Controller, Post, Get, Param, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('audio/:sessionId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @Param('sessionId') sessionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.storage.saveAudio(sessionId, file.buffer, 'webm');
    return { success: true, data: { url } };
  }

  @Get('files/*path')
  async getFile(@Param('path') filePath: string, @Res() res: Response) {
    const buffer = await this.storage.getFile(filePath);
    if (!buffer) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    res.send(buffer);
  }
}
