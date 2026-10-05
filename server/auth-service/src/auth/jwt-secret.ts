import { ConfigService } from '@nestjs/config';

export function getJwtSecret(configService: ConfigService): string {
  return configService.getOrThrow<string>('JWT_SECRET');
}