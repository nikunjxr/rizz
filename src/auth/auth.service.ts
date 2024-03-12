import {
  HttpException,
  HttpStatus,
  Injectable
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import * as jwt from "jsonwebtoken";
import { Model } from "mongoose";
import { User, UserDocument } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import * as bcrypt from 'bcrypt';
import { CommonService } from "src/common/common-service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import * as md5 from 'md5';
import { EmailOtp, EmailOtpDocument } from "src/users/entities/email-otpentity";
import { Token, TokenDocument } from "src/users/entities/token.entity";

@Injectable()
export class AuthService {
  private readonly googleAuthClient: OAuth2Client;
  private clientId: string = process.env.CLIENT_ID;
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(EmailOtp.name) private EmailOtpModel: Model<EmailOtpDocument>,
    @InjectModel(Token.name) private TokenModel: Model<TokenDocument>,
    private jwtService: JwtService,
    private userService: UsersService,
    private commonService: CommonService
  ) { 
    this.googleAuthClient = new OAuth2Client(this.clientId);
  }

  async verifyGoogleAccessToken(token) {
    try {
      const ticket = await this.googleAuthClient.verifyIdToken({
        idToken: token,
        audience: this.clientId,
      });
      const payload = ticket.getPayload();
      if(payload) {
        const email = payload.email;
        const userData = await this.userModel.findOne({ email });
        if (userData) {
          return this.createResponse(userData);
        } else {
          const newUser = await this.userModel.create({
            email,
            isVerify: true
          });
          return this.createResponse(newUser);
        }
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async verifyAppleAccessToken(token) {
    try {
      const decodedToken = jwt.decode(token, { complete: true });
      if(typeof decodedToken.payload !== 'object') {
        throw new HttpException('Invalid', HttpStatus.BAD_REQUEST);
      }
      const email = decodedToken.payload.email;
      const userData = await this.userModel.findOne({ email });
      if(userData) {
        return this.createResponse(userData);
      } else {
        const newUser = await this.userModel.create({
          email,
          isVerify: true
        });
        return this.createResponse(newUser);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async sendOtpEmail(email) {
    try {
      const OTP = await this.generateRandomOTP(6);
      
      const transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'nikunjxr192@gmail.com',
          pass: 'hhyy tmky kell ibkz', 
        }
      });
      const mailOptions = {
        from: 'nikunjxr192@gmail.com', 
        to: email, 
        subject: 'OTP Verification', 
        text: `Your OTP for login is: ${OTP}`,
      }
  
      const info = await transport.sendMail(mailOptions);

      const otpData = await this.EmailOtpModel.find({ email });
      if(otpData && otpData.length > 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Otp already send for this email',
        }
      }
      const saveOtp = {
        email : email,
        otp : OTP
      };
      const saveotp = await this.EmailOtpModel.create(saveOtp);
    
      console.log('Email sent: ' + info.response);
      return {
        message: "Email sent successfully",
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new HttpException('Failed to send email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateRandomOTP(length: number) {
    const characters = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
      OTP += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return OTP;
  }

  async verifyEmail(email: any, otp: any) {
    console.log("Email??", email);
    console.log("OTP??", otp);
    try {
      const emailData = await this.EmailOtpModel.findOne({ email });
      console.log("emailData??", emailData);
      if(!emailData) {
        throw new HttpException('Email not found for Verify', HttpStatus.BAD_REQUEST);
      }
      if(parseInt(otp) !==  emailData.otp) {
        throw new HttpException('Otp Mismatch', HttpStatus.BAD_REQUEST);
      }

      const userData = await this.userModel.findOne({ email });
      if(userData) {
        const deleteEmail = await this.EmailOtpModel.deleteMany({ email });
        return this.createResponse(userData);
      } else {
        const newUser = await this.userModel.create({
          email,
          isVerify : true,
          isProfileComplete : false
        });
        const deleteEmail = await this.EmailOtpModel.deleteMany({ email });
        console.log("Deletion Result:", deleteEmail);
        return this.createResponse(newUser);
      }

    }catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createResponse(user) {
    const token = this.jwtService.sign(
      { id: user._id },
      {
        secret: process.env.JWT_SEC,
        expiresIn: '24h',
      }
    );
    const tokenData = await this.TokenModel.create({ userId: user._id, token });
    return {
      statusCode: HttpStatus.OK,
      data: user,
      token: token,
      message: 'Successfully logged in',
    }
  }

}
