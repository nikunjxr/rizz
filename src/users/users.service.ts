import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as multer from 'multer';
import { Token, TokenDocument } from "src/users/entities/token.entity";
import { EmailOtp, EmailOtpDocument } from './entities/email-otpentity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Token.name) private TokenModel: Model<TokenDocument>,
    @InjectModel(EmailOtp.name) private EmailOtpModel: Model<EmailOtpDocument>,
    private jwtService: JwtService,
  ) {}

  async getUserFromToken(request) {
    let authHeader = request.headers.authorization;
    const decodedJwt = this.jwtService.decode(authHeader.split(' ')[1]) as any;
    const user = await this.userModel.findOne({ _id: decodedJwt?.id });
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async createProfile (req, files: Express.Multer.File[], createProfileUserDto) {
    try {
      const userDetails = await this.getUserFromToken(req);
      const userId = userDetails._id;
      const { first_name, last_name, bio, gender, d_o_b, latitude, longitude, email } = createProfileUserDto;
      // const fileUrl = `/var/www/html/xhibit-image/${files[0].filename}`;
      const fileUrls = files.map(file => `/var/www/html/xhibit-image/${file.filename}`);
      // const profileImagePath = files && files[0] ? `http://103.206.139.86/xhibit-image/${files[0].filename}` : null;
      const user = await this.userModel.findOne({ _id: userId });
      if (!user) {
        throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
      }
      interface UpdateData {
        first_name?: string;
        last_name?: string;
        bio?: string;
        gender?: string;
        d_o_b?: string;
        latitude?: string;
        longitude?: string;
        profileImage?: string[];
      };
      const age = this.calculateAge(new Date(d_o_b));
      const updateData: any = {};

      if (first_name !== undefined && first_name !== null && first_name !== '') {
        updateData.first_name = first_name as string;
      }

      if (last_name !== undefined && last_name !== null && last_name !== '') {
        updateData.last_name = last_name as string;
      }

      if (bio !== undefined && bio !== null && bio !== '') {
        updateData.bio = bio as string;
      }

      if (gender !== undefined && gender !== null && gender !== '') {
        updateData.gender = gender as string;
      }

      if (d_o_b !== undefined && d_o_b !== null && d_o_b !== '') {
        updateData.d_o_b = d_o_b as string;
      }

      if (latitude !== undefined && latitude !== null && latitude !== '') {
        updateData.latitude = latitude as string;
      }

      if (longitude !== undefined && longitude !== null && longitude !== '') {
        updateData.longitude = longitude as string;
      }

      if (files && files.length > 0) {
        const fileUrls = files.map(file => `/var/www/html/xhibit-image/${file.filename}`);
        updateData.profileImage = fileUrls;
      }
      updateData.isProfileComplete = true;
      updateData.age = age;
      const profileData = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
      return {
        statusCode: HttpStatus.OK,
        profileData,
        message : "Profile update successfully"
      }
    } catch (error) {
      console.log('error create profile', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getProfile (req) {
    try {
      const userDetails = await this.getUserFromToken(req);
      const userId = userDetails._id;
      const user = await this.userModel.findOne({ _id: userId });
      if (!user) {
        throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
      }
      
      const selectField = {
        profileImage : 1,
        name : { $concat: ["$first_name", " ", "$last_name"] },
        bio : 1,
        age : 1
      }
      const condition = {
        _id : new mongoose.Types.ObjectId(userId)
      };
      const userData = await this.userModel.findOne(condition, selectField);
      if(userData) {
        const dob = userData.d_o_b;
        const age = this.calculateAge(dob);
        return {
          statusCode: HttpStatus.OK,
          userData,
          message : "user profile get successfully"
        }
      }
    } catch (error) {
      console.log('error get profile', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  async deleteAccount (req) {
    const userDetails = await this.getUserFromToken(req);
    const userId = userDetails._id;
    const user = await this.userModel.findOne({ _id: userId });
    if(!user) {
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    }
    const deleteuser = await this.userModel.findByIdAndDelete(userId);
    return {
      statusCode: HttpStatus.OK,
      message : "delete user successfully"
    }
  }

  async logOut (req) {
    const userDetails = await this.getUserFromToken(req);
    const userId = userDetails._id;
    const user = await this.userModel.findOne({ _id: userId });
    if(!user) {
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    }
    const tokenData = await this.TokenModel.findOne({userId: userId});
    if(!tokenData) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
    }
    await this.TokenModel.deleteOne({ userId: userId});
    await this.TokenModel.updateOne({ userId: userId }, { $set: { expiresAt: new Date() } });
    return {
      statusCode : HttpStatus.OK,
      message : "Logout successfully"
    }
  }

  async getUsers (req, getUserDto) {
    try {
      const userDetails = await this.getUserFromToken(req);
      const userId = userDetails._id;
      const { gender, latitude, longitude } = getUserDto;
      const user = await this.userModel.findOne({ _id: userId });
      const selectField = {
        profileImage : 1,
        name : { $concat: ["$first_name", " ", "$last_name"] },
        bio : 1,
        age : 1,
      }
      if (!user) {
        throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
      }
      let query: {gender?:string; latitude?: string; longitude?: string } = {}
      if(gender) {
        query.gender = gender;
      }
      if(latitude) {
        query.latitude = latitude;
      }
      if(longitude) {
        query.longitude = longitude;
      }
      let userData = await this.userModel.find(query, selectField);
      if(userData.length === 0) {
        const dob = user.d_o_b;
        const today = new Date();
        let userAge = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          userAge--;
        }
        const minAge = userAge - 2;
        const maxAge = userAge + 2;
        userData = await this.userModel.find({ age: { $gte: minAge, $lte: maxAge } }, selectField);
      } 
      if(userData && userData.length > 0) {
        return {
          statusCode : HttpStatus.OK,
          userData,
          message : "users list retrive succssfully"
        }
      } else {
        return {
          statusCode : HttpStatus.BAD_REQUEST,
          message : "users not found"
        }
      }
      
    } catch (error) {
      console.log('error get users', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async changeEmail (req, changeEmail) {
    try {
      const userDetails = await this.getUserFromToken(req);
      const userId = userDetails._id;
      const { new_email, old_email, otp } = changeEmail;
      const user = await this.userModel.findOne({ _id: userId });
      if (!user) {
        throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
      }
      // const emailData = await this.userModel.findOne({ email: old_email })
      // if(!emailData) {
      //   throw new HttpException('email not found for change', HttpStatus.BAD_REQUEST);
      // }
      const email = await this.EmailOtpModel.findOne({ email: new_email });
      if(!email) {
        throw new HttpException('Email not found for Verify', HttpStatus.BAD_REQUEST);
      }
      if(parseInt(otp) !==  email.otp) {
        throw new HttpException('Otp Mismatch', HttpStatus.BAD_REQUEST);
      }

      const userData = await this.userModel.findOne({ email : old_email });
      if(userData) {
        const condition = {
          _id: new mongoose.Types.ObjectId(userId)
        };
        const updateData = {
          email : new_email
        };
        const update = await this.userModel.updateOne(condition, updateData, { new : true })
        const deleteEmail = await this.EmailOtpModel.deleteOne({ email: new_email });
        return {
          statusCode: HttpStatus.OK,
          update,
          message : "Email change successfully"
        }
      } return {
        message : "No Email Found for change"
      }
    } catch (error) {
      console.log('error changes email', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
