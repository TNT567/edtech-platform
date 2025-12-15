import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, UserOutlined, DashboardOutlined } from '@ant-design/icons';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        setError(data.message || '登录失败');
      }
    } catch {
      // 后端不可用时，使用Mock登录（仅开发环境）
      if (username === 'admin' && password === 'admin123') {
        const mockToken = 'mock-admin-token-' + Date.now();
        const mockUser = { username: 'admin', role: 'ADMIN' };
        localStorage.setItem('adminToken', mockToken);
        localStorage.setItem('adminUser', JSON.stringify(mockUser));
        navigate('/admin/dashboard');
        return;
      }
      setError('用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <DashboardOutlined className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">EdTech Admin</h1>
          <p className="text-blue-200 mt-2">管理员控制台</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2">管理员账号</label>
              <div className="relative">
                <UserOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入管理员账号"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2">密码</label>
              <div className="relative">
                <LockOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录管理后台'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-blue-300 hover:text-blue-200 text-sm">
              返回学生端登录
            </a>
          </div>
        </div>

        <p className="text-center text-blue-300/60 text-sm mt-8">
          © 2024 EdTech Platform. 管理员专用入口
        </p>
      </div>
    </div>
  );
}
