import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsUUID()
  @IsNotEmpty()
  campusId: string;
}
