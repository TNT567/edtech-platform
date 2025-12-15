import { useEffect, useRef, useState } from 'react';
import { UserOutlined, FileTextOutlined, RobotOutlined, RiseOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';

interface DashboardStats {
  totalUsers: number;
  dailyActive: number;
  totalQuestions: number;
  aiCalls: number;
  userGrowth: number;
  questionGrowth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 1256,
    dailyActive: 342,
    totalQuestions: 8934,
    aiCalls: 15678,
    userGrowth: 12.5,
    questionGrowth: 8.3
  });
  const [loading, setLoading] = useState(true);

  const trendChartRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      initTrendChart();
      initHeatmap();
      initPieChart();
    }
    
    const handleResize = () => {
      echarts.getInstanceByDom(trendChartRef.current!)?.resize();
      echarts.getInstanceByDom(heatmapRef.current!)?.resize();
      echarts.getInstanceByDom(pieChartRef.current!)?.resize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loading]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data, using mock data:', error);
      // 使用Mock数据（后端不可用时）
      setStats({
        totalUsers: 1256,
        dailyActive: 342,
        totalQuestions: 8934,
        aiCalls: 15678,
        userGrowth: 12.5,
        questionGrowth: 8.3
      });
    } finally {
      setLoading(false);
    }
  };

  const initTrendChart = () => {
    if (!trendChartRef.current) return;
    const chart = echarts.init(trendChartRef.current);
    
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(30,41,59,0.9)', borderColor: '#475569' },
      legend: { data: ['活跃用户', 'AI调用', '答题数'], textStyle: { color: '#94a3b8' }, top: 10 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: days, axisLine: { lineStyle: { color: '#475569' } }, axisLabel: { color: '#94a3b8' } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#475569' } }, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#334155' } } },
      series: [
        { name: '活跃用户', type: 'line', smooth: true, data: [320, 332, 301, 334, 390, 330, 342], itemStyle: { color: '#3b82f6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.3)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) } },
        { name: 'AI调用', type: 'line', smooth: true, data: [2200, 2500, 2100, 2800, 3200, 2900, 3100], itemStyle: { color: '#10b981' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16,185,129,0.3)' }, { offset: 1, color: 'rgba(16,185,129,0)' }]) } },
        { name: '答题数', type: 'bar', data: [1200, 1400, 1100, 1500, 1800, 1600, 1700], itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] } }
      ]
    });
  };

  const initHeatmap = () => {
    if (!heatmapRef.current) return;
    const chart = echarts.init(heatmapRef.current);
    
    const hours = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];
    const days = ['周日', '周六', '周五', '周四', '周三', '周二', '周一'];
    const data: [number, number, number][] = [];
    
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 12; j++) {
        data.push([j, i, Math.round(Math.random() * 100)]);
      }
    }

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { position: 'top', formatter: (p: { data: number[] }) => `${days[p.data[1]]} ${hours[p.data[0]]}:00 - 掌握度: ${p.data[2]}%` },
      grid: { left: '15%', right: '10%', top: '10%', bottom: '15%' },
      xAxis: { type: 'category', data: hours, splitArea: { show: true }, axisLabel: { color: '#94a3b8' } },
      yAxis: { type: 'category', data: days, splitArea: { show: true }, axisLabel: { color: '#94a3b8' } },
      visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: '0%', inRange: { color: ['#1e3a5f', '#3b82f6', '#10b981', '#f59e0b'] }, textStyle: { color: '#94a3b8' } },
      series: [{ name: '掌握度', type: 'heatmap', data: data, label: { show: false }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }]
    });
  };

  const initPieChart = () => {
    if (!pieChartRef.current) return;
    const chart = echarts.init(pieChartRef.current);
    
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: 'rgba(30,41,59,0.9)', borderColor: '#475569' },
      legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: '#94a3b8' } },
      series: [{
        name: '知识点分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#1e293b', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' } },
        labelLine: { show: false },
        data: [
          { value: 1048, name: '函数', itemStyle: { color: '#3b82f6' } },
          { value: 735, name: '几何', itemStyle: { color: '#10b981' } },
          { value: 580, name: '代数', itemStyle: { color: '#f59e0b' } },
          { value: 484, name: '概率', itemStyle: { color: '#ef4444' } },
          { value: 300, name: '其他', itemStyle: { color: '#8b5cf6' } }
        ]
      }]
    });
  };

  const statCards = [
    { title: '总用户数', value: stats.totalUsers, icon: <UserOutlined />, color: 'blue', growth: stats.userGrowth },
    { title: '今日活跃', value: stats.dailyActive, icon: <RiseOutlined />, color: 'green', growth: 5.2 },
    { title: '题目总数', value: stats.totalQuestions, icon: <FileTextOutlined />, color: 'yellow', growth: stats.questionGrowth },
    { title: 'AI调用次数', value: stats.aiCalls, icon: <RobotOutlined />, color: 'purple', growth: 23.1 },
  ];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-600 to-blue-400',
    green: 'from-emerald-600 to-emerald-400',
    yellow: 'from-amber-600 to-amber-400',
    purple: 'from-purple-600 to-purple-400'
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">平台总览</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{card.value.toLocaleString()}</p>
                <p className="text-emerald-400 text-sm mt-2">
                  <RiseOutlined className="mr-1" />+{card.growth}%
                </p>
              </div>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorMap[card.color]} flex items-center justify-center`}>
                <span className="text-2xl text-white">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">平台趋势</h3>
          <div ref={trendChartRef} className="h-80" />
        </div>

        {/* Pie Chart */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">知识点分布</h3>
          <div ref={pieChartRef} className="h-80" />
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">学习掌握度热力图</h3>
        <div ref={heatmapRef} className="h-80" />
      </div>
    </div>
  );
}
