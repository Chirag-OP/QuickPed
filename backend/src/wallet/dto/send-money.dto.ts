import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class SendMoneyDto {
  @IsString()
  recipientPhoneNumber: string;
  @IsNumber()
  @Min(1)
  amount: number;
  @IsOptional()
  @IsString()
  note?: string;
}
