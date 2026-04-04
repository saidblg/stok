import { IsString, IsNotEmpty } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Mesaj boş olamaz' })
  message: string;
}

export class ChatResponseDto {
  response: string;
  timestamp: Date;
}
