import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, 
  Network, 
  PenTool, 
  BarChart2, 
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';

const MENU_ITEMS = [
  { path: '/', label: '首页', icon: Home },
  { path: '/knowledge-graph', label: '知识图谱', icon: Network },
  { path: '/practice', label: '智能刷题', icon: PenTool },
  { path: '/report', label: '成长报告', icon: BarChart2 },
];

export default function AppLayout() {
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex p-4 gap-4 overflow-hidden">
      {/* Floating Sidebar */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 flex-shrink-0 flex flex-col bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6 z-10"
      >
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
            E
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
            EdTech AI
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors duration-200",
                  isActive ? "text-primary-600 font-medium" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {/* Active Background (Framer Motion layoutId) */}
                {isActive && (
                  <motion.div
                    layoutId="active-menu-bg"
                    className="absolute inset-0 bg-primary-50 rounded-2xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Hover Background (Optional, using simple CSS or another motion div) */}
                
                <span className="relative z-10">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-100 space-y-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 w-full transition-all">
            <Settings size={20} />
            <span>设置</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-all">
            <LogOut size={20} />
            <span>退出</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-w-0">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 bg-white/60 backdrop-blur-md border border-white/20 shadow-sm rounded-3xl p-8 overflow-y-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
