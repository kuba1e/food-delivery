import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../prisma/PrismaService';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();

    const accessToken = req.headers.accesstoken as string;
    const refreshToken = req.headers.refreshtoken as string;

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Please login to access this resource.');
    }

    if (accessToken) {
      const decoded = this.jwtService.verify(accessToken, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      });

      if (!decoded) {
        throw new UnauthorizedException(
          'Please login to access this resource.',
        );
      }

      await this.updateAccessToken(accessToken);
    }

    return true;
  }

  private async updateAccessToken(req: any) {
    try {
      const refreshTokenData = req.headers.refreshToken as string;
      const decoded = this.jwtService.verify(refreshTokenData, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      });

      if (!decoded) {
        throw new UnauthorizedException(
          'Please login to access this resource.',
        );
      }

      const user = await this.prismaService.user.findUnique({
        where: {
          email: decoded.email,
        },
      });

      const accessToken = await this.jwtService.sign(
        { id: user.id, email: user.email },
        {
          secret: this.configService.get('ACCESS_TOKEN_SECRET'),
          expiresIn: '15m',
        },
      );

      const refreshToken = await this.jwtService.sign(
        { id: user.id, email: user.email },
        {
          secret: this.configService.get('REFRESH_TOKEN_SECRET'),
          expiresIn: '7d',
        },
      );

      req.accessToken = accessToken;
      req.refreshToken = refreshToken;
      req.user = user;
    } catch (error) {}
  }
}
