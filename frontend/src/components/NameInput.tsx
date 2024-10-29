// src/components/NameInput.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { JOIN_ROOM } from '../graphql/mutations';
import '../css/wolf_style.css';

const NameInput: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const [joinRoom] = useMutation(JOIN_ROOM);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() !== '') {
      try {
        const { data } = await joinRoom({ variables: { roomId: 'room1', name } });
        localStorage.setItem('playerId', data.joinRoom.id);
        localStorage.setItem('playerName', data.joinRoom.name);
        navigate('/player');
      } catch (error) {
        console.error('Failed to join room:', error);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>✨ お名前を入力しようネ！ ✨</h2>
      </div>
      <form onSubmit={handleNameSubmit} className="vote-section">
        <input
          type="text"
          className="vote-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <button type="submit" className="vote-button">ゲーム開始</button>
      </form>
    </div>
  );
};

export default NameInput;
