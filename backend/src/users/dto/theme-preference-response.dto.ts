import { ApiProperty } from '@nestjs/swagger';

export class ThemePreferenceResponseDto {
  @ApiProperty({ enum: ['light', 'dark'] })
  themePreference: 'light' | 'dark';
}
