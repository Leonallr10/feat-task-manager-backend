import { Injectable } from '@nestjs/common';
import { UserRepository } from '../data-access';
import { UserRole } from '../models';

export interface CreateUserParams {
  email: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  createUser(params: CreateUserParams) {
    return this.userRepository.create(params);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  findById(id: string) {
    return this.userRepository.findById(id);
  }
}

