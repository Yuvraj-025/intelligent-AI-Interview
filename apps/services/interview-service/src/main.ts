import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConfig } from '@voxhire/config';

async function bootstrap() {
  const config = getConfig();
  const app = await NestFactory.create(AppModule);
  const port = config.INTERVIEW_SERVICE_PORT;
  await app.listen(port);
  console.log(`🎙️ Interview Service running on http://localhost:${port}`);
}

bootstrap();
