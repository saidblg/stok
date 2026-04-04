import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatMessageDto, ChatResponseDto } from './dto/chat-message.dto';

@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post()
  async chat(@Body() body: ChatMessageDto): Promise<ChatResponseDto> {
    const response = await this.aiChatService.chat(body.message);
    return {
      response,
      timestamp: new Date(),
    };
  }
}
