import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksService } from '@task-manager/tasks';
import { TaskRepository } from '@task-manager/data-access';
import { TaskStatus } from '@task-manager/models';

describe('TasksService', () => {
  let service: TasksService;
  let repo: {
    create: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
    updateById: jest.Mock;
    deleteById: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useValue: repo },
      ],
    }).compile();
    service = moduleRef.get(TasksService);
  });

  it('createTask sets ownerId and default status', async () => {
    repo.create.mockResolvedValue({ _id: '1' });
    await service.createTask({ title: 'Hello' }, 'user-abc');
    expect(repo.create).toHaveBeenCalledWith({
      title: 'Hello',
      description: undefined,
      status: TaskStatus.TODO,
      ownerId: 'user-abc',
    });
  });

  it('findTasksForUser returns all for admin', async () => {
    repo.find.mockResolvedValue([]);
    await service.findTasksForUser('u1', true);
    expect(repo.find).toHaveBeenCalledWith({});
  });

  it('findTasksForUser scopes to owner for USER', async () => {
    repo.find.mockResolvedValue([]);
    await service.findTasksForUser('u1', false);
    expect(repo.find).toHaveBeenCalledWith({ ownerId: 'u1' });
  });

  it('updateTaskForUser throws when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      service.updateTaskForUser('id', {}, { userId: 'u', role: 'USER' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('updateTaskForUser forbids non-owner non-admin', async () => {
    repo.findById.mockResolvedValue({
      ownerId: 'other',
      completedAt: null,
    });
    await expect(
      service.updateTaskForUser('id', { title: 'x' }, { userId: 'me', role: 'USER' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('updateTaskForUser sets completedAt when moving to DONE', async () => {
    repo.findById.mockResolvedValue({
      ownerId: 'me',
      completedAt: null,
    });
    repo.updateById.mockResolvedValue({});
    await service.updateTaskForUser(
      'id',
      { status: TaskStatus.DONE },
      { userId: 'me', role: 'USER' },
    );
    expect(repo.updateById).toHaveBeenCalledWith(
      'id',
      expect.objectContaining({
        status: TaskStatus.DONE,
        completedAt: expect.any(Date),
      }),
    );
  });

  it('deleteTaskForUser allows admin', async () => {
    repo.findById.mockResolvedValue({ ownerId: 'other' });
    repo.deleteById.mockResolvedValue({});
    await service.deleteTaskForUser('id', { userId: 'admin', role: 'ADMIN' });
    expect(repo.deleteById).toHaveBeenCalledWith('id');
  });
});
