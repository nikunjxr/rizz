import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
})
export class EmailOtp {
   @Prop({ required: true })
   email: string;

   @Prop()
   otp: number;

   
}
export type EmailOtpDocument = EmailOtp & Document;
export const EmailOtpSchema = SchemaFactory.createForClass(EmailOtp);
