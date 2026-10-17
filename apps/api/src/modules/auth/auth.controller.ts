import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginCommand } from './commands/login.command';
import { RegisterCommand } from './commands/register.command';
import type { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  register(@Body() dto: RegisterDto) {
    return this.commandBus.execute(new RegisterCommand(dto.email, dto.password, dto.name));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход по email и паролю' })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Body() dto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Профиль текущего пользователя' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}