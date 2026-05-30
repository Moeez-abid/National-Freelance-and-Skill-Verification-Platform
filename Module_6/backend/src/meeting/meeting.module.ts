import { Module } from '@nestjs/common';
import { MeetingController } from './meeting.controller';
import { DailyService } from './daily.service';

@Module({
  controllers: [MeetingController],
  providers: [DailyService],
})
export class MeetingModule {}