import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const THEME_PREFERENCES = ['light', 'dark'] as const;

export class UpdateThemePreferenceDto {
  @ApiProperty({ enum: THEME_PREFERENCES, example: 'dark' })
  @IsIn(THEME_PREFERENCES, { message: 'themePreference light veya dark olmalıdır' })
  themePreference: 'light' | 'dark';
}
