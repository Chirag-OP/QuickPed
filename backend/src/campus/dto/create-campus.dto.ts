import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested, IsNumber, IsEnum } from 'class-validator';
import { Role, VehicleType } from '@prisma/client';
export class FareConfigDto {
  @IsEnum(VehicleType)
  vehicleType: VehicleType;
  @IsEnum(Role)
  userRole: Role;
  @IsNumber()
  baseFare: number;
  @IsNumber()
  baseDurationMinutes: number;
  @IsNumber()
  perMinuteRate: number;
}
export class CreateCampusDto {
  @IsString()
  name: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FareConfigDto)
  fareConfigurations: FareConfigDto[];
}
