import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // In real app: Call API
    if (username === 'admin' || username === 'student') {
        localStorage.setItem('token', 'mock_jwt_token');
        localStorage.setItem('role', username === 'admin' ? 'ADMIN' : 'STUDENT');
        navigate('/');
    } else {
        alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">EdTech SaaS Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Username</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="admin or student"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Any password"
                />
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
                Sign In
            </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
            Enterprise Tenant? <a href="#" className="text-indigo-600">Login with SSO</a>
        </p>
      </div>
    </div>
  );
}
