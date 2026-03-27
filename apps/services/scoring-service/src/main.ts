import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConfig } from '@voxhire/config';

async function bootstrap() {
  const config = getConfig();
  const app = await NestFactory.create(AppModule);
  const port = config.SCORING_SERVICE_PORT;
  await app.listen(port);
  console.log(`📊 Scoring Service running on http://localhost:${port}`);
}

bootstrap();
