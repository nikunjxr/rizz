import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Model } from 'mongoose';

@Schema({
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
})
export class Token {
   @Prop({ required: true })
   userId: mongoose.Types.ObjectId;

   @Prop()
   token: string;

   
}
export type TokenDocument = Token & Document;
export const TokenSchema = SchemaFactory.createForClass(Token);
