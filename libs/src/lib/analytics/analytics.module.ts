import { Module } from '@nestjs/common';
import { RolesGuard } from '@task-manager/auth';
import { MongoModule } from '@task-manager/data-access';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [MongoModule],
  providers: [AnalyticsService, RolesGuard],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}

