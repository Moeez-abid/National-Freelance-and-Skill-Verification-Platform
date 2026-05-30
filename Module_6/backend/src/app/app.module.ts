import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediaModule } from '../media/media.module';
import { ConfigModule } from '@nestjs/config';
import { MeetingModule } from '../meeting/meeting.module';
import { ChatModule } from '../chat/chat.module';   
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    /**
     * ConfigModule.forRoot() loads .env into process.env globally.
     * isGlobal: true means we don't need to re-import ConfigModule
     * in every sub-module — process.env is available everywhere.
     * envFilePath: explicitly points to .env in the backend root.
     */
    ConfigModule.forRoot({isGlobal: true, envFilePath: '.env'}),
    MediaModule,
    MeetingModule,
    ChatModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}