import { useState, useEffect } from 'react';
import { SearchOutlined, ReloadOutlined, WarningOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

interface LogEntry {
  id: number;
  type: 'operation' | 'error' | 'info';
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  user: string;
  ip: string;
  path: string;
  timestamp: string;
  details?: string;
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'operation' | 'error'>('operation');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => { fetchLogs(); }, [activeTab]);

  const fetchLogs = async () => {
    setLoading(true);
    // Mock data
    setTimeout(() => {
      if (activeTab === 'operation') {
        setLogs([
          { id: 1, type: 'operation', level: 'success', message: '管理员登录成功', user: 'admin', ip: '192.168.1.100', path: '/api/admin/login', timestamp: '2024-12-15 10:30:25' },
          { id: 2, type: 'operation', level: 'info', message: '查询用户列表', user: 'admin', ip: '192.168.1.100', path: '/api/admin/users', timestamp: '2024-12-15 10:31:02' },
          { id: 3, type: 'operation', level: 'success', message: '新增知识点: 三角函数', user: 'admin', ip: '192.168.1.100', path: '/api/admin/knowledge-points', timestamp: '2024-12-15 10:35:18' },
          { id: 4, type: 'operation', level: 'warning', message: '删除用户: student_test', user: 'admin', ip: '192.168.1.100', path: '/api/admin/users/123', timestamp: '2024-12-15 10:40:33' },
          { id: 5, type: 'operation', level: 'info', message: '更新Prompt模板', user: 'admin', ip: '192.168.1.100', path: '/api/admin/prompts/1', timestamp: '2024-12-15 10:45:12' },
          { id: 6, type: 'operation', level: 'success', message: '导出统计报表', user: 'admin', ip: '192.168.1.100', path: '/api/admin/statistics/export', timestamp: '2024-12-15 10:50:45' },
          { id: 7, type: 'operation', level: 'info', message: '查看系统日志', user: 'admin', ip: '192.168.1.100', path: '/api/admin/logs', timestamp: '2024-12-15 10:55:00' },
        ]);
      } else {
        setLogs([
          { id: 101, type: 'error', level: 'error', message: 'AI API调用失败: 429 Too Many Requests', user: 'system', ip: '-', path: '/api/ai/generate-question', timestamp: '2024-12-15 09:15:33', details: 'Error: Rate limit exceeded. Please retry after 60 seconds.\nStack trace:\n  at AIService.callQwen(AIService.java:156)\n  at ContentGenerationService.generateQuestion(ContentGenerationService.java:89)' },
          { id: 102, type: 'error', level: 'error', message: '数据库连接超时', user: 'system', ip: '-', path: '/api/practice/submit', timestamp: '2024-12-15 08:45:12', details: 'Connection timeout after 30000ms\nDatabase: edtech_db\nHost: localhost:3306' },
          { id: 103, type: 'error', level: 'warning', message: 'Redis缓存未命中', user: 'system', ip: '-', path: '/api/knowledge/states', timestamp: '2024-12-15 08:30:05', details: 'Cache miss for key: student:1:mastery\nFallback to database query' },
          { id: 104, type: 'error', level: 'error', message: 'JWT Token验证失败', user: 'unknown', ip: '203.45.67.89', path: '/api/user/profile', timestamp: '2024-12-15 07:22:18', details: 'Invalid token signature\nToken: eyJhbGciOiJIUzI1NiIs...' },
          { id: 105, type: 'error', level: 'warning', message: 'AI响应解析失败', user: 'system', ip: '-', path: '/api/ai/generate-question', timestamp: '2024-12-15 06:55:40', details: 'Failed to parse JSON response from AI\nRaw response: ```json\n{invalid json}' },
        ]);
      }
      setLoading(false);
    }, 500);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircleOutlined className="text-emerald-400" />;
      case 'warning': return <WarningOutlined className="text-amber-400" />;
      case 'error': return <CloseCircleOutlined className="text-red-400" />;
      default: return <InfoCircleOutlined className="text-blue-400" />;
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'success': return 'bg-emerald-500/10 border-emerald-500/30';
      case 'warning': return 'bg-amber-500/10 border-amber-500/30';
      case 'error': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(search.toLowerCase()) ||
    log.path.toLowerCase().includes(search.toLowerCase()) ||
    log.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">系统日志</h1>
        <button onClick={fetchLogs} className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
          <ReloadOutlined className="mr-2" />刷新
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('operation')}
          className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'operation' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          操作日志
        </button>
        <button
          onClick={() => setActiveTab('error')}
          className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'error' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          错误日志
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索日志..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center text-slate-400">加载中...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center text-slate-400">暂无日志记录</div>
        ) : filteredLogs.map(log => (
          <div
            key={log.id}
            onClick={() => setSelectedLog(log)}
            className={`bg-slate-800 rounded-xl p-4 border cursor-pointer transition-all hover:border-slate-600 ${getLevelBg(log.level)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-1">{getLevelIcon(log.level)}</div>
                <div>
                  <p className="text-white font-medium">{log.message}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                    <span>用户: {log.user}</span>
                    <span>IP: {log.ip}</span>
                    <span className="text-blue-400">{log.path}</span>
                  </div>
                </div>
              </div>
              <span className="text-slate-500 text-sm whitespace-nowrap">{log.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getLevelIcon(selectedLog.level)}
                <h2 className="text-xl font-bold text-white">日志详情</h2>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm">时间</label>
                  <p className="text-white">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">用户</label>
                  <p className="text-white">{selectedLog.user}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">IP地址</label>
                  <p className="text-white">{selectedLog.ip}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">请求路径</label>
                  <p className="text-blue-400">{selectedLog.path}</p>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm">消息</label>
                <p className="text-white">{selectedLog.message}</p>
              </div>
              {selectedLog.details && (
                <div>
                  <label className="text-slate-400 text-sm">详细信息</label>
                  <pre className="bg-slate-900 rounded-lg p-4 text-slate-300 text-sm overflow-x-auto mt-2 whitespace-pre-wrap">{selectedLog.details}</pre>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
