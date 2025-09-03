'use client';

interface Activity {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string;
  timestamp: Date;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-gray-500">No recent activity</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 5).map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 truncate">
              {activity.action} {activity.resourceType}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(activity.timestamp).toLocaleDateString()} at{' '}
              {new Date(activity.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
