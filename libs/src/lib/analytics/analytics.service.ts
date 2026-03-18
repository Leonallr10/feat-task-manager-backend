import { Injectable } from '@nestjs/common';
import { TaskRepository } from '@task-manager/data-access';

@Injectable()
export class AnalyticsService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async getTaskAnalytics() {
    const [statusCounts, perUserCounts, completionTimes] = await Promise.all([
      this.taskRepository.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.taskRepository.aggregate([
        { $group: { _id: '$ownerId', count: { $sum: 1 } } },
      ]),
      this.taskRepository.aggregate([
        {
          $match: {
            completedAt: { $ne: null },
          },
        },
        {
          $project: {
            diffMs: {
              $subtract: ['$completedAt', '$createdAt'],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgDiffMs: { $avg: '$diffMs' },
          },
        },
      ]),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of statusCounts) {
      statusMap[s._id] = s.count;
    }

    const userMap: Record<string, number> = {};
    for (const u of perUserCounts) {
      userMap[String(u._id)] = u.count;
    }

    const avgCompletionTimeMs = completionTimes[0]?.avgDiffMs ?? null;

    return {
      statusCounts: statusMap,
      perUserTaskCounts: userMap,
      averageCompletionTimeMs: avgCompletionTimeMs,
    };
  }
}

