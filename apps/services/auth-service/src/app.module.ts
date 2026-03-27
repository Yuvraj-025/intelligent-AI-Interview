import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getConfig } from '@voxhire/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisService } from './redis.service';

const config = getConfig();

@Module({
  imports: [
    JwtModule.register({
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: config.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RedisService],
})
export class AppModule {}
