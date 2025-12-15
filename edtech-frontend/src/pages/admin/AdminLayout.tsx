import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  RobotOutlined,
  BarChartOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/admin/knowledge', icon: <BookOutlined />, label: '知识点管理' },
  { key: '/admin/prompts', icon: <RobotOutlined />, label: 'AI Prompt管理' },
  { key: '/admin/statistics', icon: <BarChartOutlined />, label: '数据统计' },
  { key: '/admin/logs', icon: <FileTextOutlined />, label: '系统日志' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [adminUser, setAdminUser] = useState<{ username: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    if (user) {
      setAdminUser(JSON.parse(user));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const getBreadcrumb = () => {
    const item = menuItems.find(m => m.key === location.pathname);
    return item?.label || '仪表盘';
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <DashboardOutlined className="text-2xl text-blue-500" />
          {!collapsed && <span className="ml-3 text-xl font-bold text-white">Admin</span>}
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map(item => (
            <Link
              key={item.key}
              to={item.key}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                location.pathname === item.key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-white transition-colors"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-slate-400">
            <span>管理后台</span>
            <span className="mx-2">/</span>
            <span className="text-white">{getBreadcrumb()}</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <BellOutlined className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <SettingOutlined className="text-xl" />
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-700">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <UserOutlined className="text-white" />
              </div>
              <span className="text-white">{adminUser?.username || 'Admin'}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                title="退出登录"
              >
                <LogoutOutlined />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
