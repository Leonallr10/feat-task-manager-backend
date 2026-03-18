import { Test } from '@nestjs/testing';
import { AnalyticsService } from '@task-manager/analytics';
import { TaskRepository } from '@task-manager/data-access';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let aggregate: jest.Mock;

  beforeEach(async () => {
    aggregate = jest
      .fn()
      .mockResolvedValueOnce([{ _id: 'TODO', count: 2 }])
      .mockResolvedValueOnce([{ _id: 'u1', count: 3 }])
      .mockResolvedValueOnce([{ avgDiffMs: 5000 }]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: TaskRepository,
          useValue: { aggregate },
        },
      ],
    }).compile();
    service = moduleRef.get(AnalyticsService);
  });

  it('getTaskAnalytics aggregates status, per-user, and completion time', async () => {
    const result = await service.getTaskAnalytics();
    expect(result.statusCounts).toEqual({ TODO: 2 });
    expect(result.perUserTaskCounts).toEqual({ u1: 3 });
    expect(result.averageCompletionTimeMs).toBe(5000);
    expect(aggregate).toHaveBeenCalledTimes(3);
  });

  it('returns null average when no completed tasks', async () => {
    aggregate
      .mockReset()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const result = await service.getTaskAnalytics();
    expect(result.averageCompletionTimeMs).toBeNull();
  });
});
