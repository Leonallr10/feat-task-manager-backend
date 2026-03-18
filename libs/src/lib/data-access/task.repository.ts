import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Task } from './schemas/task.schema';
import { TaskStatus } from '../models';

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  ownerId: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  completedAt?: Date | null;
}

@Injectable()
export class TaskRepository {
  constructor(@InjectModel(Task.name) private readonly model: Model<Task>) {}

  create(input: CreateTaskInput) {
    return this.model.create(input);
  }

  find(filter: FilterQuery<Task>) {
    return this.model.find(filter).exec();
  }

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  async updateById(id: string, update: UpdateTaskInput) {
    return this.model
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .exec();
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  aggregate(pipeline: any[]) {
    return this.model.aggregate(pipeline).exec();
  }
}

