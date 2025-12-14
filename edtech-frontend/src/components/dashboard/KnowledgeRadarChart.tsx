import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, PolarRadiusAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const chartData = data.map(item => ({
    ...item,
    fullMark: 1.0,
    // Add effect for high mastery
    isGold: item.score > 0.9
  }));

  // Handle click on chart area (simplified interaction)
  // Recharts PolarAngleAxis onClick is tricky, often best to put list on side.
  // But we can try onClick on Radar or Axis.
  
  return (
    <div className="h-[300px] w-full relative">
      {/* Gold Border Effect Layer (CSS) */}
      <div className="absolute inset-0 pointer-events-none rounded-full" />
      
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="knowledgePointName" 
            tick={({ x, y, payload, index }) => {
                const item = chartData[index];
                const isGold = item && item.score > 0.9;
                return (
                    <text 
                        x={x} y={y} 
                        dy={4} 
                        textAnchor="middle" 
                        fill={isGold ? '#d97706' : '#64748b'} 
                        fontSize={12}
                        fontWeight={isGold ? 'bold' : 'normal'}
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate('/practice')} // Quick jump to practice
                    >
                        {isGold ? '👑 ' : ''}{payload.value}
                    </text>
                );
            }} 
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
