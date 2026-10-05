import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ login: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Log in and set an HttpOnly access cookie' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', maxLength: 64 },
        password: { type: 'string', maxLength: 72 },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Login succeeded; accessToken cookie set.' })
  @ApiUnauthorizedResponse({ description: 'Credentials are invalid.' })
  @ApiResponse({ status: 429, description: 'Login rate limit exceeded.' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const { accessToken } = await this.authService.login(
      body.username,
      body.password,
    );

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000,
    });

    return { message: 'Login successful' };
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Clear the access cookie' })
  @ApiOkResponse({ description: 'The access cookie has been cleared.' })
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    response.clearCookie('accessToken', { path: '/' });
    return { message: 'Logged out' };
  }
}