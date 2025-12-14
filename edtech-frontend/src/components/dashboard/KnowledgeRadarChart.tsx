import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';

export interface KnowledgeStateVO {
  knowledgePointId: number;
  knowledgePointName: string;
  score: number; // 0.0 - 1.0
  level: string;
}

interface Props {
  data: KnowledgeStateVO[];
}

export function KnowledgeRadarChart({ data }: Props) {
  // Convert 0-1 score to percentage or keep as is.
  // We'll multiply by 100 for better tooltip display, or customize formatter.
  const chartData = data.map(item => ({
    ...item,
    fullMark: 1.0
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="knowledgePointName" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Radar
            name="掌握度"
            dataKey="score"
            stroke="#8b5cf6" // Violet-500
            strokeWidth={3}
            fill="#a78bfa"   // Violet-400
            fillOpacity={0.4}
            isAnimationActive={true}
          />
          <Tooltip 
            formatter={(value: number) => [(value * 100).toFixed(1) + '%', '掌握度']}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
