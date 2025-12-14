import { useEffect, useState } from 'react';
import { getStudentReport, type StudentExerciseLog } from '../api/services/knowledge';
import { BentoCard } from '../components/ui/BentoCard';

export default function ReportPage() {
  const [logs, setLogs] = useState<StudentExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentReport(1).then(res => { // Hardcoded studentId=1
        setLogs(res);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading Report...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Growth Report</h2>
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
