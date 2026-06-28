import { IsNumber, Min } from 'class-validator';
export class TopUpDto {
  @IsNumber()
  @Min(50)
  amount: number;
}
