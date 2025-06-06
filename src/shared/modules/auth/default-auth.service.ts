import { inject, injectable } from 'inversify';
import { Component } from '../../types/component.enum.js';
import { Logger } from '../../libs/logger/index.js';
import { UserService } from '../user/user-service.interface.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { AuthService } from './auth-service.interface.js';
import { UserEntity } from '../user/index.js';
import * as crypto from 'node:crypto';
import { TokenPayload } from './types/TokenPayload.js';
import { SignJWT } from 'jose';
import { JWT_ALGORITHM, JWT_EXPIRED } from './auth.constant.js';
import { LoginUserDto } from '../user/dto/login-user.dto.js';
import {
  UserNotFoundException,
  UserPasswordIncorrectException,
} from './errors/index.js';

@injectable()
export class DefaultAuthService implements AuthService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly config: Config<RestSchema>
  ) {}

  public async authenticate(user: UserEntity): Promise<string> {
    const jwtSecret = this.config.get('JWT_SECRET');
    const secretKey = crypto.createSecretKey(jwtSecret, 'utf-8');

    const payload: TokenPayload = {
      id: user.id,
      name: user.name,
      mail: user.mail,
    };

    this.logger.info(`Generating JWT for user: ${user.mail}`);

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRED)
      .sign(secretKey);
  }

  public async verify(dto: LoginUserDto): Promise<UserEntity> {
    const { mail, password } = dto;
    const user = await this.userService.findByEmail(mail);

    if (!user) {
      this.logger.warn(`Login failed: user not found - ${mail}`);
      throw new UserNotFoundException();
    }

    const isPasswordValid = user.verifyPassword(password, this.config.get('SALT'));

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: incorrect password for ${mail}`);
      throw new UserPasswordIncorrectException();
    }

    return user;
  }
}
