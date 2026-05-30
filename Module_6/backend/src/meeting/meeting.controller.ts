import { Controller, Post, Body } from '@nestjs/common';
import { DailyService } from './daily.service';

@Controller('meeting')
export class MeetingController {
  constructor(private dailyService: DailyService) {}

  @Post('create')
  createMeeting(@Body() body: any) {
    const title = body?.title || 'Default Meeting';
    return this.dailyService.createMeeting(title);
  }
}