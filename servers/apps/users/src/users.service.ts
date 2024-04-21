import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/PrismaService';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

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

    if (!isPhoneNumberExist) {
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
    

    // const user = await this.prismaService.user.create({
    //   data: user,
    // });

    return { user, response };
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = {
      email,
      password,
    };

    return user;
  }

  async getUsers() {
    return this.prismaService.user.findMany({});
  }
}
