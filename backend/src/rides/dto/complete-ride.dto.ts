import { IsISO8601, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class CompleteRideDto {
  @IsString()
  vehicleId: string;
  @IsString()
  startDock: string;
  @IsString()
  endDock: string;
  @IsNumber()
  @Min(0)
  fare: number;
  @IsNumber()
  @Min(1)
  duration: number;
  @IsNumber()
  @Min(0)
  distance: number;
  @IsOptional()
  @IsString()
  bikeType?: string;
  @IsOptional()
  @IsISO8601()
  startedAt?: string;
}
