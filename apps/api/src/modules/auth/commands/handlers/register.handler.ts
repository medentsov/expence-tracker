import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { AuthResponse, User } from '@tracker/shared';
import * as bcrypt from 'bcryptjs';
import { CreateUserCommand } from '../../../users/commands/create-user.command';
import { TokenService } from '../../services/token.service';
import { RegisterCommand } from '../register.command';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand, AuthResponse> {
  private static readonly BCRYPT_ROUNDS = 10;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: RegisterCommand): Promise<AuthResponse> {
    const passwordHash = await bcrypt.hash(command.password, RegisterHandler.BCRYPT_ROUNDS);

    // Создание пользователя — через шину: модуль users сам решает,
    // как проверять уникальность и какие ошибки бросать.
    const user = await this.commandBus.execute<CreateUserCommand, User>(
      new CreateUserCommand(command.email, passwordHash, command.name),
    );

    const accessToken = await this.tokenService.sign({
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });

    return { accessToken, user };
  }
}