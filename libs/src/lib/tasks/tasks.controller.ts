import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard, Roles } from '../auth';
import { UserRole } from '../models';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.createTask(dto, req.user.userId);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('status') status?: string,
  ) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    const tasksPromise = this.tasksService.findTasksForUser(
      req.user.userId,
      isAdmin,
    );

    // Simple filtering by status if provided
    if (!status) {
      return tasksPromise;
    }
    const statusEnum = status as any;
    return tasksPromise.then((tasks) =>
      tasks.filter((t: any) => t.status === statusEnum),
    );
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req: any) {
    return this.tasksService.updateTaskForUser(id, dto, req.user);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.deleteTaskForUser(id, req.user);
  }
}

