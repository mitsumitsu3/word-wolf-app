import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import LoginForm from './components/LoginForm';
import PlayerDashboard from './components/PlayerDashboard';
import Guest from './components/Guest';
import NameInput from './components/NameInput';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/player" element={<PlayerDashboard />} />
        <Route path="/guest" element={<Guest />} />
        {/* デフォルトはログイン画面 */}
        <Route path="/" element={<NameInput />} />
      </Routes>
    </Router>
  );
};

export default App;
