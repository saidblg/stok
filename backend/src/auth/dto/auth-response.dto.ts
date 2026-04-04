import { ApiProperty } from '@nestjs/swagger';

export class UserPayloadDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'] })
  role: string;

  @ApiProperty({ enum: ['light', 'dark'] })
  themePreference: string;
}

export class AuthResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({ type: UserPayloadDto })
  user: UserPayloadDto;
}
