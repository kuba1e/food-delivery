import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  ActivationResponse,
  LoginResponse,
  RegisterResponse,
} from './types/user.types';
import { ActivationDto, RegisterDto } from './dto/user.dto';
import { BadRequestException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Response } from 'express';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UsersService) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto,
    @Context() context: { res: Response },
  ): Promise<RegisterResponse> {
    const { name, email, password } = registerDto;

    if (!name || !email || !password) {
      throw new BadRequestException('Please fill all the fields.');
    }

    const { activation_token } = await this.userService.register(
      registerDto,
      context.res,
    );

    return { activation_token };
  }

  @Mutation(() => ActivationResponse)
  async activateUser(
    @Args('activationInput') activationDto: ActivationDto,
    @Context() context: { res: Response },
  ): Promise<ActivationResponse> {
    const { user } = await this.userService.activateUser(
      activationDto,
      context.res,
    );
    return { user };
  }

  @Mutation(() => User)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<LoginResponse> {
    return await this.userService.login({ email, password });
  }

  @Query(() => [User])
  async getUsers() {
    return this.userService.getUsers();
  }
}
