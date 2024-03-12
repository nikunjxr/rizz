import { ApiPropertyOptional } from '@nestjs/swagger';

export class changeEmailDto {
  @ApiPropertyOptional()
  old_email: string;

  @ApiPropertyOptional()
  new_email: string;

}
