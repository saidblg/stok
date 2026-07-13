import { Module } from '@nestjs/common';
import { EkstreService } from './ekstre.service';
import { EkstreController } from './ekstre.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EkstreController],
  providers: [EkstreService],
})
export class EkstreModule {}
