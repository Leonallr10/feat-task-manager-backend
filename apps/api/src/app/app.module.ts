import { Module } from '@nestjs/common';
import { AuthModule } from '@task-manager/auth';
import { AnalyticsModule } from '@task-manager/analytics';
import { TasksModule } from '@task-manager/tasks';
import { UsersModule } from '@task-manager/users';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [AuthModule, UsersModule, TasksModule, AnalyticsModule],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
