import { useState, useEffect, useRef } from 'react';
import { SearchOutlined, EyeOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';

interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  grade: string;
  totalPoints: number;
  masteryLevel: number;
  lastActive: string;
  createdAt: string;
}

interface UserDetail {
  user: User;
  knowledgeStates: { name: string; mastery: number }[];
  wrongQuestions: { id: number; content: string; knowledgePoint: string; wrongCount: number }[];
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const radarRef = useRef<HTMLDivElement>(null);
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  useEffect(() => {
    if (showModal && selectedUser && radarRef.current) {
      initRadarChart();
    }
  }, [showModal, selectedUser]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?page=${page}&size=${pageSize}&search=${search}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.data.list);
          setTotal(data.data.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Mock data for demo
      setUsers([
        { id: 1, username: 'student001', nickname: '张三', email: 'zhangsan@test.com', grade: '高一', totalPoints: 1250, masteryLevel: 72, lastActive: '2024-12-15 10:30', createdAt: '2024-09-01' },
        { id: 2, username: 'student002', nickname: '李四', email: 'lisi@test.com', grade: '高二', totalPoints: 2100, masteryLevel: 85, lastActive: '2024-12-15 09:15', createdAt: '2024-08-15' },
        { id: 3, username: 'student003', nickname: '王五', email: 'wangwu@test.com', grade: '高三', totalPoints: 3200, masteryLevel: 91, lastActive: '2024-12-14 22:00', createdAt: '2024-07-20' },
        { id: 4, username: 'student004', nickname: '赵六', email: 'zhaoliu@test.com', grade: '高一', totalPoints: 890, masteryLevel: 58, lastActive: '2024-12-15 08:45', createdAt: '2024-10-01' },
        { id: 5, username: 'student005', nickname: '钱七', email: 'qianqi@test.com', grade: '高二', totalPoints: 1680, masteryLevel: 76, lastActive: '2024-12-13 16:20', createdAt: '2024-09-10' },
      ]);
      setTotal(50);
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetail = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedUser(data.data);
          setShowModal(true);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    }
    
    // Mock data
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser({
        user,
        knowledgeStates: [
          { name: '函数', mastery: 85 },
          { name: '几何', mastery: 72 },
          { name: '代数', mastery: 90 },
          { name: '概率', mastery: 65 },
          { name: '三角', mastery: 78 }
        ],
        wrongQuestions: [
          { id: 1, content: '已知函数f(x)=x²+2x+1...', knowledgePoint: '二次函数', wrongCount: 3 },
          { id: 2, content: '在直角三角形ABC中...', knowledgePoint: '三角函数', wrongCount: 2 },
          { id: 3, content: '设随机变量X服从正态分布...', knowledgePoint: '概率统计', wrongCount: 2 }
        ]
      });
      setShowModal(true);
    }
  };

  const initRadarChart = () => {
    if (!radarRef.current || !selectedUser) return;
    const chart = echarts.init(radarRef.current);
    
    const indicators = selectedUser.knowledgeStates.map(k => ({ name: k.name, max: 100 }));
    const values = selectedUser.knowledgeStates.map(k => k.mastery);

    chart.setOption({
      backgroundColor: 'transparent',
      radar: {
        indicator: indicators,
        shape: 'polygon',
        splitNumber: 5,
        axisName: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155' } },
        splitArea: { areaStyle: { color: ['rgba(59,130,246,0.1)', 'rgba(59,130,246,0.2)'] } },
        axisLine: { lineStyle: { color: '#475569' } }
      },
      series: [{
        type: 'radar',
        data: [{
          value: values,
          name: '知识掌握度',
          areaStyle: { color: 'rgba(59,130,246,0.4)' },
          lineStyle: { color: '#3b82f6', width: 2 },
          itemStyle: { color: '#3b82f6' }
        }]
      }]
    });
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'text-emerald-400';
    if (level >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">用户管理</h1>
        <div className="relative">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="搜索用户..."
            className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">用户</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">年级</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">积分</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">掌握度</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">最后活跃</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">加载中...</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <UserOutlined className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.nickname}</p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300">{user.grade}</td>
                <td className="px-6 py-4 text-amber-400 font-medium">{user.totalPoints}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-slate-700 rounded-full mr-2">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${user.masteryLevel}%` }} />
                    </div>
                    <span className={getMasteryColor(user.masteryLevel)}>{user.masteryLevel}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">{user.lastActive}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button onClick={() => viewUserDetail(user.id)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="查看详情">
                      <EyeOutlined />
                    </button>
                    <button className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="删除">
                      <DeleteOutlined />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <p className="text-slate-400 text-sm">共 {total} 条记录</p>
          <div className="flex space-x-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors">上一页</button>
            <span className="px-4 py-2 text-white">{page} / {Math.ceil(total / pageSize)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / pageSize)} className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors">下一页</button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">学生详情 - {selectedUser.user.nickname}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">知识掌握雷达图</h3>
                <div ref={radarRef} className="h-64" />
              </div>
              {/* Wrong Questions */}
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">错题本 ({selectedUser.wrongQuestions.length})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedUser.wrongQuestions.map(q => (
                    <div key={q.id} className="bg-slate-800 rounded-lg p-3">
                      <p className="text-white text-sm line-clamp-2">{q.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-blue-400 text-xs">{q.knowledgePoint}</span>
                        <span className="text-red-400 text-xs">错误 {q.wrongCount} 次</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
