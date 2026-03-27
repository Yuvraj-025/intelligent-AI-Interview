import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConfig } from '@voxhire/config';

async function bootstrap() {
  const config = getConfig();
  const app = await NestFactory.create(AppModule);
  const port = config.ANALYTICS_SERVICE_PORT;
  await app.listen(port);
  console.log(`📈 Analytics Service running on http://localhost:${port}`);
}

bootstrap();
