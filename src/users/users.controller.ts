import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFiles, HttpException, HttpStatus
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/lib/jwt-auth.guard';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags } from "@nestjs/swagger";
import { CreateProfileUserDto } from './dto/create-profile.dto';
import { GetUserDto } from './dto/get-users.dto';
import { changeEmailDto } from './dto/change-email.dto';
import * as multer from 'multer';

@Controller('users')
@ApiTags("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/profile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          format: 'binary',
        },
        first_name: {
          type: 'string',
        },
        last_name: {
          type: 'string',
        },
        b_o_d: {
          type: 'string',
        },
        bio: {
          type: 'string',
        },
        latitude: {
          type: 'string',
        },
        longitude: {
          type: 'string',
        },
        gender: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: '/var/www/html/xhibit-image/',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  updateProfile(
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProfileUserDto: CreateProfileUserDto,
  ) {
    return this.usersService.createProfile(req, files, createProfileUserDto);
  }

  @Get('getprofile')
  getProfile(@Req() req) {
    return this.usersService.getProfile(req);
  }

  @Post('delete-account')
  async deleteAccount(@Req() req) {
    return await this.usersService.deleteAccount(req);
  }

  @Post('logout')
  logOut(@Req() req,) {
    return this.usersService.logOut(req)
  }

  @Post('recommendation')
  getUsers(@Req() req, @Body() getUserDto: GetUserDto) {
    return this.usersService.getUsers(req, getUserDto);
  }

  @Post('change-email')
  changeEmail (@Req() req, @Body() changeEmailDto: changeEmailDto) {
    return this.usersService.changeEmail(req, changeEmailDto)
  }

}
