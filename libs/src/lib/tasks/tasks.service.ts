import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from '../data-access';
import { TaskStatus } from '../models';

export interface CurrentUser {
  userId: string;
  role: string;
}

export interface CreateTaskDtoLike {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskDtoLike {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

@Injectable()
export class TasksService {
  constructor(private readonly taskRepository: TaskRepository) {}

  createTask(dto: CreateTaskDtoLike, currentUserId: string) {
    return this.taskRepository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status ?? TaskStatus.TODO,
      ownerId: currentUserId,
    });
  }

  findTasksForUser(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.taskRepository.find({});
    }
    return this.taskRepository.find({ ownerId: userId });
  }

  async updateTaskForUser(
    id: string,
    dto: UpdateTaskDtoLike,
    currentUser: CurrentUser,
  ) {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    if (
      currentUser.role !== 'ADMIN' &&
      String(existing.ownerId) !== String(currentUser.userId)
    ) {
      throw new ForbiddenException('Not allowed to update this task');
    }

    const update: any = { ...dto };
    if (dto.status === TaskStatus.DONE && !existing.completedAt) {
      update.completedAt = new Date();
    }

    if (dto.status && dto.status !== TaskStatus.DONE) {
      update.completedAt = null;
    }

    return this.taskRepository.updateById(id, update);
  }

  async deleteTaskForUser(id: string, currentUser: CurrentUser) {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    if (
      currentUser.role !== 'ADMIN' &&
      String(existing.ownerId) !== String(currentUser.userId)
    ) {
      throw new ForbiddenException('Not allowed to delete this task');
    }

    return this.taskRepository.deleteById(id);
  }
}

