import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@task-manager/auth';
import { UserRole } from '@task-manager/models';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('tasks')
  @Roles(UserRole.ADMIN)
  getTaskAnalytics() {
    return this.analyticsService.getTaskAnalytics();
  }
}

