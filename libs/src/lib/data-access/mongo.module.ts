import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './user.repository';
import { TaskRepository } from './task.repository';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.COSMOS_MONGO_URI ||
          process.env.MONGO_URI ||
          'mongodb://localhost:27017/task-manager',
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  providers: [UserRepository, TaskRepository],
  exports: [MongooseModule, UserRepository, TaskRepository],
})
export class MongoModule {}

