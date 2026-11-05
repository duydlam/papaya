import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}
  async login(username: string, password: string) {
    if (
      username !== (process.env.DEMO_USERNAME ?? 'papaya') ||
      password !== (process.env.DEMO_PASSWORD ?? 'papaya')
    )
      throw new UnauthorizedException('Invalid credentials');
    return { accessToken: await this.jwt.signAsync({ sub: username }) };
  }
}
