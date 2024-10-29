import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../utils/cognitoAuth';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const token = await signIn(username, password);
      console.log('Login successful! Token:', token);
      if (token) {
        localStorage.setItem('jwtToken', token); // トークンを保存
        navigate('/admin');
      } else {
        setError('ログインに失敗しました');
      }

    } catch (e) {
      setError('ログインに失敗しました');
      console.error('Login error:', e);
    }
  };

  return (
    <div>
      <h2>管理者ログイン</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>ユーザー名</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>パスワード</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
};

export default LoginForm;
