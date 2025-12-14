import { useEffect, useState } from 'react';
import { getKnowledgeGraph, type KnowledgePoint } from '../api/services/knowledge';
import { BentoCard } from '../components/ui/BentoCard';

export default function KnowledgeGraphPage() {
  const [data, setData] = useState<Record<string, KnowledgePoint[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKnowledgeGraph().then(res => {
        setData(res);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading Graph...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-slate-800">Knowledge Graph</h2>
      {Object.entries(data).map(([subject, points]) => (
        <div key={subject}>
          <h3 className="text-xl font-semibold mb-4 text-slate-700">{subject}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {points.map(kp => (
              <BentoCard key={kp.id} title={kp.name} className="p-4">
                <p className="text-sm text-slate-500 mt-2">{kp.description || "No description"}</p>
              </BentoCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
