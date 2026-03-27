import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConfig } from '@voxhire/config';

async function bootstrap() {
  const config = getConfig();
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = config.API_GATEWAY_PORT;
  await app.listen(port);
  console.log(`🚀 API Gateway running on http://localhost:${port}`);
}

bootstrap();
