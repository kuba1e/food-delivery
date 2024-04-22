import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ActivationDto, LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/PrismaService';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email/email.service';
import { TokenSender } from './utils/sendToken';

interface UserData {
  name: string;
  email: string;
  password: string;
  phone_number: number;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto, response: Response) {
    const { name, email, password, phone_number, address } = registerDto;

    const isEmailExist = await this.prismaService.user.findUnique({
      where: { email: email },
    });

    if (isEmailExist) {
      throw new BadRequestException('User already exist with this email.');
    }

    const isPhoneNumberExist = await this.prismaService.user.findUnique({
      where: { phone_number },
    });

    if (isPhoneNumberExist) {
      throw new BadRequestException(
        'User already exist with this phone number.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name,
      email,
      password: hashedPassword,
      phone_number,
      address,
    };

    const activationToken = await this.createActivationToken(user);
    const activationCode = activationToken.activationCode;

    this.emailService.sendEmail({
      email,
      subject: 'Activate your account!',
      template: './activation-mail',
      name,
      activationCode,
    });

    return { activation_token: activationToken.token, response };
  }

  async createActivationToken(user: UserData) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = await this.jwtService.sign(
      {
        user,
        activationCode,
      },
      { secret: this.configService.get('ACTIVATION_SECRET'), expiresIn: '5m' },
    );

    return { token, activationCode };
  }

  async activateUser(activationDto: ActivationDto, response: Response) {
    const { activationCode, activationToken } = activationDto;

    const newUser: { user: UserData; activationCode: string } =
      await this.jwtService.verify(activationToken, {
        secret: this.configService.get('ACTIVATION_SECRET'),
      });

    if (newUser.activationCode !== activationCode) {
      throw new BadRequestException('Activation code is invalid!');
    }

    const { name, email, password, phone_number } = newUser.user;

    const existUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existUser) {
      throw new BadRequestException('User with this email already exist!');
    }

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password,
        phone_number,
      },
    });

    return { user, response };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('User with this email does not exist!');
    }

    const passwordMatched = await this.comparePassword(password, user.password);

    if (passwordMatched) {
      const tokenSender = new TokenSender(this.configService, this.jwtService);
      return tokenSender.sendToken(user);
    } else {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        error: {
          message: 'Invalid email or password',
        },
      };
    }
  }

  async comparePassword(passwordToCompare: string, hashedPassword: string) {
    return await bcrypt.compare(passwordToCompare, hashedPassword);
  }

  async getUsers() {
    return this.prismaService.user.findMany({});
  }
}
