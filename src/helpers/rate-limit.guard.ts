import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// 100 requests per 15 minutes per IP
const rateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 900, // 15 minutes
});

@Injectable()
export class RateLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const ip = req.ip || req.connection.remoteAddress;
    try {
      await rateLimiter.consume(ip);
      return true;
    } catch {
      throw new BadRequestException(
        'Too many requests, please try again later.',
      );
    }
  }
}
