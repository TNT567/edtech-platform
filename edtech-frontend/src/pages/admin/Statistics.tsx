import { useEffect, useRef, useState } from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';

export default function Statistics() {
  const [dateRange, setDateRange] = useState('week');
  const trendChartRef = useRef<HTMLDivElement>(null);
  const knowledgeChartRef = useRef<HTMLDivElement>(null);
  const userActivityRef = useRef<HTMLDivElement>(null);
  const accuracyChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initCharts();
    const handleResize = () => {
      echarts.getInstanceByDom(trendChartRef.current!)?.resize();
      echarts.getInstanceByDom(knowledgeChartRef.current!)?.resize();
      echarts.getInstanceByDom(userActivityRef.current!)?.resize();
      echarts.getInstanceByDom(accuracyChartRef.current!)?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dateRange]);

  const initCharts = () => {
    initTrendChart();
    initKnowledgeChart();
    initUserActivityChart();
    initAccuracyChart();
  };

  const initTrendChart = () => {
    if (!trendChartRef.current) return;
    const chart = echarts.init(trendChartRef.current);
    
    const dates = dateRange === 'week' 
      ? ['12/9', '12/10', '12/11', '12/12', '12/13', '12/14', '12/15']
      : ['11/15', '11/22', '11/29', '12/6', '12/13'];

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(30,41,59,0.9)', borderColor: '#475569' },
      legend: { data: ['新增用户', '活跃用户', '答题数', 'AI调用'], textStyle: { color: '#94a3b8' }, top: 10 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: '#475569' } }, axisLabel: { color: '#94a3b8' } },
      yAxis: [
        { type: 'value', name: '用户数', axisLine: { lineStyle: { color: '#475569' } }, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#334155' } } },
        { type: 'value', name: '次数', axisLine: { lineStyle: { color: '#475569' } }, axisLabel: { color: '#94a3b8' }, splitLine: { show: false } }
      ],
      series: [
        { name: '新增用户', type: 'bar', data: [15, 22, 18, 25, 30, 28, 35], itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
        { name: '活跃用户', type: 'line', smooth: true, data: [320, 332, 301, 334, 390, 330, 342], itemStyle: { color: '#10b981' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16,185,129,0.3)' }, { offset: 1, color: 'rgba(16,185,129,0)' }]) } },
        { name: '答题数', type: 'line', smooth: true, yAxisIndex: 1, data: [1200, 1400, 1100, 1500, 1800, 1600, 1700], itemStyle: { color: '#f59e0b' } },
        { name: 'AI调用', type: 'line', smooth: true, yAxisIndex: 1, data: [2200, 2500, 2100, 2800, 3200, 2900, 3100], itemStyle: { color: '#8b5cf6' } }
      ]
    });
  };

  const initKnowledgeChart = () => {
    if (!knowledgeChartRef.current) return;
    const chart = echarts.init(knowledgeChartRef.current);

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(30,41,59,0.9)', borderColor: '#475569' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', axisLine: { lineStyle: { color: '#475569' } }, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#334155' } } },
      yAxis: { type: 'category', data: ['三角函数', '概率统计', '立体几何', '解析几何', '数列', '导数', '函数'], axisLine: { lineStyle: { color: '#475569' } }, axisLabel: { color: '#94a3b8' } },
      series: [{
        name: '练习次数',
        type: 'bar',
        data: [1820, 2100, 1560, 2340, 1890, 2780, 3200],
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#8b5cf6' }
          ])
        },
        label: { show: true, position: 'right', color: '#94a3b8' }
      }]
    });
  };

  const initUserActivityChart = () => {
    if (!userActivityRef.current) return;
    const chart = echarts.init(userActivityRef.current);

    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const data = [5, 3, 2, 1, 1, 2, 8, 25, 45, 52, 48, 42, 38, 35, 40, 55, 68, 72, 65, 58, 45, 32, 18, 10];

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(30,41,59,0.9)', borderColor: '#475569', formatter: '{b}<br/>活跃用户: {c}人' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: '#475569' } }, axisLabel: { color: '#94a3b8', interval: 2 } },
      yAxis: { type: 'value', name: '活跃用户', axisLine: { lineStyle: { color: '#475569' } }, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#334155' } } },
      series: [{
        type: 'line',
        data: data,
        smooth: true,
        symbol: 'none',
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16,185,129,0.5)' },
            { offset: 1, color: 'rgba(16,185,129,0)' }
          ])
        }
      }]
    });
  };

  const initAccuracyChart = () => {
    if (!accuracyChartRef.current) return;
    const chart = echarts.init(accuracyChartRef.current);

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: 'rgba(30,41,59,0.9)', borderColor: '#475569' },
      legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: '#94a3b8' } },
      series: [{
        name: '正确率分布',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#1e293b', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' } },
        data: [
          { value: 235, name: '90%以上', itemStyle: { color: '#10b981' } },
          { value: 456, name: '70-90%', itemStyle: { color: '#3b82f6' } },
          { value: 312, name: '50-70%', itemStyle: { color: '#f59e0b' } },
          { value: 147, name: '50%以下', itemStyle: { color: '#ef4444' } }
        ]
      }]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">数据统计</h1>
        <div className="flex items-center space-x-2">
          <CalendarOutlined className="text-slate-400" />
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">最近7天</option>
            <option value="month">最近30天</option>
          </select>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">平台趋势分析</h3>
        <div ref={trendChartRef} className="h-80" />
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">知识点热度排行</h3>
          <div ref={knowledgeChartRef} className="h-80" />
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">用户正确率分布</h3>
          <div ref={accuracyChartRef} className="h-80" />
        </div>
      </div>

      {/* User Activity Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">24小时用户活跃分布</h3>
        <div ref={userActivityRef} className="h-64" />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '本周新增用户', value: '173', change: '+12.5%', positive: true },
          { label: '本周答题总数', value: '9,847', change: '+8.3%', positive: true },
          { label: '平均正确率', value: '72.4%', change: '+2.1%', positive: true },
          { label: 'AI调用成功率', value: '99.2%', change: '-0.3%', positive: false }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            <p className={`text-sm mt-1 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
