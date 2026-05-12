import { useState } from 'react';
import { useStore } from '../store/useStore';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function Login() {
  const login = useStore(s => s.login);
  const storeName = useStore(s => s.settings.storeName);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = login(username, password);
    setLoading(false);
    if (!ok) setError('פרטי התחברות שגויים');
    else setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-secondary to-background" dir="rtl">
      <Card className="w-full max-w-md p-8 shadow-elegant">

        {/* Logo + title */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <img src="/icon.png" alt="לוגו" style={{ height: 90, width: 'auto' }} />
          <div className="text-center">
            <h1 className="text-2xl font-bold">{storeName}</h1>
            <p className="text-sm text-muted-foreground">התחבר כדי להמשיך</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>שם משתמש</Label>
            <Input
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="שם משתמש"
              dir="ltr"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>סיסמה</Label>
            <Input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'מתחבר...' : 'התחבר'}
          </Button>
        </form>

      </Card>

      {/* Animated GIF below the login card — loops forever */}
      <div className="mt-6">
        <img
          src="/login-anim.gif"
          alt=""
          style={{ maxHeight: 180, objectFit: 'contain', display: 'block' }}
        />
      </div>

    </div>
  );
}
