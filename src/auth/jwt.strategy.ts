// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Socket } from 'socket.io';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // Ensure this matches the secret used in AuthService
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }

  static extractJwtFromSocket(socket: Socket): string | null {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (token?.startsWith('Bearer ')) {
      return token.slice(7);
    }
    return token || null;
  }
}
