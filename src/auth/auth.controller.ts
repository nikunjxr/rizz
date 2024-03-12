import {
  Body,
  Controller,
  Get,
  HttpCode, Param,
  Post,
  Query,
  Req
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { AuthService } from "./auth.service";


@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(200)
  @Get('google-verify')
  verifyGoogleAccessToken(@Query('token') token: string) {
    return this.authService.verifyGoogleAccessToken(token);
  }

  @HttpCode(200)
  @Get('apple-verify')
  async verifyAppleAccessToken(@Query('token') token: string) {
    return await this.authService.verifyAppleAccessToken(token);
  }

  @HttpCode(200)
  @Get('sendOtp')
  sendOtpEmail(@Query('email') email: string) {
    return this.authService.sendOtpEmail(email);
  }

  @HttpCode(200)
  @Post('verify-email')
  verifyEmail(@Query('email') email: any, @Query('otp') otp: any) {
    return this.authService.verifyEmail(email, otp);
  }

}
