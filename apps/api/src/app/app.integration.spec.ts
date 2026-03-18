import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AuthController } from './auth.controller';
import { AuthService, JwtAuthGuard } from '@task-manager/auth';
import { UsersService } from '@task-manager/users';
import { TasksController } from '@task-manager/tasks';
import { TasksService } from '@task-manager/tasks';
import { AnalyticsController } from '@task-manager/analytics';
import { AnalyticsService } from '@task-manager/analytics';
import { UserRole } from '@task-manager/models';

jest.mock('bcryptjs', () => ({
  hash: jest.fn((p: string) => Promise.resolve(`hashed:${p}`)),
  compare: jest.fn(),
}));

describe('Auth API (integration, mocked persistence)', () => {
  let app: INestApplication;
  let users: {
    findByEmail: jest.Mock;
    createUser: jest.Mock;
  };

  beforeEach(async () => {
    users = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/auth/register returns accessToken', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.createUser.mockResolvedValue({
      id: 'user-1',
      email: 'a@b.com',
      role: UserRole.USER,
    });
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'password123' })
      .expect(201);
    expect(res.body.accessToken).toBeDefined();
  });

  it('POST /api/auth/login returns accessToken', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    users.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      password: 'hashed:password123',
      role: UserRole.USER,
    });
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'password123' })
      .expect(201);
    expect(res.body.accessToken).toBeDefined();
  });
});

const mockJwtUser = (userId: string, role: string): CanActivate => ({
  canActivate: (ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    req.user = { userId, role };
    return true;
  },
});

describe('Tasks API (integration, mocked TasksService)', () => {
  let app: INestApplication;
  let tasks: {
    createTask: jest.Mock;
    findTasksForUser: jest.Mock;
  };

  beforeEach(async () => {
    tasks = {
      createTask: jest.fn().mockResolvedValue({
        _id: 't1',
        title: 'Hello',
        ownerId: 'u1',
      }),
      findTasksForUser: jest.fn().mockResolvedValue([
        { _id: 't1', title: 'Hello', ownerId: 'u1' },
      ]),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: tasks },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtUser('u1', 'USER'))
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/tasks and GET /api/tasks', async () => {
    await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', 'Bearer fake')
      .send({ title: 'Hello' })
      .expect(201);
    expect(tasks.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Hello' }),
      'u1',
    );

    const list = await request(app.getHttpServer())
      .get('/api/tasks')
      .set('Authorization', 'Bearer fake')
      .expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body[0].title).toBe('Hello');
  });
});

describe('Analytics API (integration, mocked AnalyticsService)', () => {
  let app: INestApplication;
  let analytics: { getTaskAnalytics: jest.Mock };

  beforeEach(async () => {
    analytics = {
      getTaskAnalytics: jest.fn().mockResolvedValue({
        statusCounts: { TODO: 1 },
        perUserTaskCounts: { u1: 1 },
        averageCompletionTimeMs: 100,
      }),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: analytics },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtUser('admin-1', 'ADMIN'))
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/analytics/tasks returns analytics for ADMIN', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/analytics/tasks')
      .set('Authorization', 'Bearer fake')
      .expect(200);
    expect(res.body.statusCounts).toEqual({ TODO: 1 });
    expect(analytics.getTaskAnalytics).toHaveBeenCalled();
  });
});

describe('Analytics API USER forbidden (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: { getTaskAnalytics: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtUser('u1', 'USER'))
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/analytics/tasks returns 403 for USER', async () => {
    await request(app.getHttpServer())
      .get('/api/analytics/tasks')
      .set('Authorization', 'Bearer fake')
      .expect(403);
  });
});
