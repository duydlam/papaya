import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentConfig } from '../config/environment-config.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvironmentConfig>,
  ) {}

  async login(username: string, password: string) {
    if (
      username !== (this.config.get('DEMO_USERNAME') ?? 'papaya') ||
      password !== (this.config.get('DEMO_PASSWORD') ?? 'papaya')
    )
      throw new UnauthorizedException('Invalid credentials');
    return { accessToken: await this.jwt.signAsync({ sub: username }) };
  }

  async demoLogin() {
    const username = this.config.get('DEMO_USERNAME') ?? 'papaya';
    return { accessToken: await this.jwt.signAsync({ sub: username }) };
  }
}
