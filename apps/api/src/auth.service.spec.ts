import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '@task-manager/auth';
import { UsersService } from '@task-manager/users';
import { UserRole } from '@task-manager/models';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let users: { findByEmail: jest.Mock; createUser: jest.Mock };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    users = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
    };
    jwt = { sign: jest.fn().mockReturnValue('signed-jwt') };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
    (bcrypt.compare as jest.Mock).mockReset();
  });

  it('register creates user and returns token', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.createUser.mockResolvedValue({
      id: 'id1',
      email: 'a@b.com',
      role: UserRole.USER,
    });
    const out = await service.register({
      email: 'a@b.com',
      password: 'secret12',
    });
    expect(out.accessToken).toBe('signed-jwt');
    expect(bcrypt.hash).toHaveBeenCalled();
  });

  it('register throws when email exists', async () => {
    users.findByEmail.mockResolvedValue({ email: 'a@b.com' });
    await expect(
      service.register({ email: 'a@b.com', password: 'secret12' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login returns token when password matches', async () => {
    users.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      password: 'stored',
      role: UserRole.USER,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const out = await service.login({
      email: 'a@b.com',
      password: 'correct',
    });
    expect(out.accessToken).toBe('signed-jwt');
  });

  it('login throws when password does not match', async () => {
    users.findByEmail.mockResolvedValue({
      email: 'a@b.com',
      password: 'stored',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: 'a@b.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
