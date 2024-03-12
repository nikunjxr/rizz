import { ApiPropertyOptional } from '@nestjs/swagger';
import { GenderType } from 'src/enum/gender.enum';

export class CreateProfileUserDto {
  @ApiPropertyOptional()
  profileImage: string;

  @ApiPropertyOptional()
  email: string;

  @ApiPropertyOptional()
  first_name: string;

  @ApiPropertyOptional()
  last_name: string;

  @ApiPropertyOptional()
  d_o_b: string;

  @ApiPropertyOptional()
  latitude: string;

  @ApiPropertyOptional()
  longitude: string;

  @ApiPropertyOptional()
  bio: string;

  @ApiPropertyOptional({ enum: GenderType })
  gender: GenderType;
}
