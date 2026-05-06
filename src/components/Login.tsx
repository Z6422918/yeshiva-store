import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const login = useStore(s => s.login);
  const storeName = useStore(s => s.settings.storeName);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(username, password);
    if (!ok) setError('שם משתמש או סיסמה שגויים');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">ח</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{storeName}</h1>
          <p className="text-gray-500 mt-1">כניסה למערכת</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User size={18} className="absolute right-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="שם משתמש"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2.5 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute right-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2.5 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            כניסה
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">משתמש ברירת מחדל: admin / 1234</p>
      </div>
    </div>
  );
}
