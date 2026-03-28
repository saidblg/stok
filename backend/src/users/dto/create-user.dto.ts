import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString({ message: 'Şifre zorunludur' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;

  @ApiProperty({ example: 'Ahmet Yılmaz' })
  @IsString({ message: 'İsim zorunludur' })
  @MinLength(2, { message: 'İsim en az 2 karakter olmalıdır' })
  name: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'], default: 'USER' })
  @IsOptional()
  @IsEnum(['ADMIN', 'USER'], { message: 'Rol ADMIN veya USER olmalıdır' })
  role?: 'ADMIN' | 'USER';
}
