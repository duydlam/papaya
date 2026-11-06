import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('demo') demoLogin() {
    return this.auth.demoLogin();
  }

  @Post('login') login(@Body() dto: LoginDto) {
    return this.auth.login(dto.username, dto.password);
  }
}
