import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { GenderType } from "src/enum/gender.enum";
import mongoose from "mongoose";

@Schema({
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
})
export class User {
   @Prop({ required: true })
   email: string;

   @Prop({default: []})
   profileImage: string[];

   @Prop()
   first_name: string;

   @Prop()
   last_name: string;

   @Prop({ enum: GenderType})
   gender: string;

   @Prop({ type : Date })
   d_o_b: Date;

   @Prop()
   latitude: string;

   @Prop()
   longitude: string;

   @Prop()
   bio: string;

   @Prop({default: false})
   isVerify: boolean;

   @Prop({default: false})
   isProfileComplete: boolean;

   @Prop()
   age: number;

   @Prop()
   createdAt: Date;
}
export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
