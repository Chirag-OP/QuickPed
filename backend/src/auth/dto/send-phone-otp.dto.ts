import { IsString, IsNotEmpty } from 'class-validator';

export class SendPhoneOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
