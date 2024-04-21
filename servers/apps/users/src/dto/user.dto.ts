import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

@InputType()
export class RegisterDto {
  @Field()
  @IsEmail()
  @IsNotEmpty({ message: 'Name is required.' })
  @IsString({ message: 'Name must to be one string.' })
  name: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password does not match minimum length rule.' })
  password: string;

  @Field()
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @Field()
  @IsPhoneNumber(undefined, { message: 'Phone number is not invalid' })
  @IsNotEmpty({ message: 'Phone is required.' })
  phone_number: number;

  @Field()
  @IsNotEmpty({ message: 'Address is required.' })
  address: string;
}

@InputType()
export class LoginDto {
  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password does not match minimum length rule.' })
  password: string;

  @Field()
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;
}
