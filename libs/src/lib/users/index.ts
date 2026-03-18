import { Module } from '@nestjs/common';
import { MongoModule } from '../data-access';
import { UsersService } from './users.service';

@Module({
  imports: [MongoModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

export { UsersService } from './users.service';

