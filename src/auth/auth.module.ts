import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './lib/jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CommonService } from 'src/common/common-service';
import { UsersService } from "src/users/users.service";
import { User, UserSchema } from 'src/users/entities/user.entity';
import { EmailOtp, EmailOtpSchema } from 'src/users/entities/email-otpentity';
import { Token, TokenSchema } from 'src/users/entities/token.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: EmailOtp.name, schema: EmailOtpSchema }]),
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SEC,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtService,CommonService, UsersService],
})
export class AuthModule {}
