import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetUserDto {
  @ApiPropertyOptional()
  gender: string;

  @ApiPropertyOptional()
  latitude: string;

  @ApiPropertyOptional()
  longitude: string;

}
