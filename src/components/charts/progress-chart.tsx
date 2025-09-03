'use client';

interface TrendData {
  period: string;
  score: number;
  responses: number;
  evidence: number;
}

interface ProgressChartProps {
  data: TrendData[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium">No data available</div>
          <div className="text-sm">Progress data will appear here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{item.period}</span>
                <span className="text-sm text-gray-500">{item.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(item.score, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{item.responses} responses</span>
                <span>{item.evidence} evidence items</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
