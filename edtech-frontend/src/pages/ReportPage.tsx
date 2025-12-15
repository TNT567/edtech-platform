import { useEffect, useState } from 'react';
import { getStudentReport, getMasteryTrend, type StudentExerciseLog, type MasteryTrendPoint } from '../api/services/knowledge';
import { BentoCard } from '../components/ui/BentoCard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function ReportPage() {
  const [logs, setLogs] = useState<StudentExerciseLog[]>([]);
  const [trend, setTrend] = useState<MasteryTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStudentReport(1),
      getMasteryTrend(1, 30)
    ]).then(([logsRes, trendRes]) => {
      setLogs(logsRes);
      setTrend(trendRes);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading Report...</div>;

  return (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-800">Growth Report</h2>
        <BentoCard title="Mastery Trend (Last 30 Days)" className="p-6">
        {trend.length === 0 ? (
          <p className="text-slate-500">No trend data available.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                />
                <Tooltip
                  formatter={(value: number | string, name: string) => {
                    if (name === 'accuracy') {
                      const numeric = typeof value === 'number' ? value : Number(value || 0);
                      return [`${(numeric * 100).toFixed(1)}%`, 'Accuracy'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label: string | number) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        </BentoCard>
        <BentoCard title="Exercise History" className="p-6">
        {logs.length === 0 ? (
            <p className="text-slate-500">No exercise records found.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">Time</th>
                            <th className="p-2">Question ID</th>
                            <th className="p-2">Result</th>
                            <th className="p-2">Duration (s)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-b last:border-0">
                                <td className="p-2">{new Date(log.submitTime).toLocaleString()}</td>
                                <td className="p-2">#{log.questionId}</td>
                                <td className="p-2">
                                    <span className={log.result === 1 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                        {log.result === 1 ? "Correct" : "Wrong"}
                                    </span>
                                </td>
                                <td className="p-2">{log.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        </BentoCard>
    </div>
  );
}
