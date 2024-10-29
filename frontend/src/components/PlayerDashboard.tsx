import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { ON_WORDS_DISTRIBUTED, ON_GAME_FINISH, ON_PLAYER_KICKED } from '../graphql/subscriptions';
import { GET_PLAYER, GET_ROOM } from '../graphql/queries';
import { VOTE_PLAYER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';
import '../css/wolf_style.css';

const PlayerDashboard: React.FC = () => {
  const [word, setWord] = useState('');
  const [voteTarget, setVoteTarget] = useState('');
  const [gameResults, setGameResults] = useState<{ name: string; voteTarget: string }[]>([]);

  const playerId = localStorage.getItem('playerId');
  const playerName = localStorage.getItem('playerName');
  const roomId = 'room1';
  const [votePlayer] = useMutation(VOTE_PLAYER);
  const navigate = useNavigate();

  useEffect(() => {
    if (!playerId) {
      navigate('/');
      return;
    }
  }, [navigate]);

  const { data: playerData, loading: playerLoading, error: playerError } = useQuery(GET_PLAYER, {
    variables: { playerId },
    skip: !playerId,
  });

  const { data, loading, error } = useSubscription(ON_WORDS_DISTRIBUTED, {
    variables: { playerId: playerId },
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('Subscription data received:', subscriptionData);
    },
  });

  // サブスク
  const { data: gameFinishData } = useSubscription(ON_GAME_FINISH);
  const { data: playerKickedData } = useSubscription(ON_PLAYER_KICKED);
  const { data: roomData, loading: roomLoading, error: roomError } = useQuery(GET_ROOM, {
    variables: { roomId },
    skip: !roomId,
  });

  useEffect(() => {
    if (playerData && !playerLoading && playerData.getPlayer) {
      setWord(playerData.getPlayer.word || '');
    }
    if (playerError) {
      console.error('Failed to fetch player data:', playerError);
    }
  }, [playerData, playerLoading, playerError]);

  useEffect(() => {
    if (data && !loading) {
      if (data.onWordsDistributed.id === playerId) {
        setWord(data.onWordsDistributed.word || '');
      }
      console.log('WebSocket connected successfully, data received.');
    }
    if (error) {
      console.error('WebSocket connection failed:', error);
    }
  }, [data, loading, error, playerId]);

  // ゲーム完了時の処理
  useEffect(() => {
    if (gameFinishData && gameFinishData.onGameFinish.endGame) {
      setGameResults(gameFinishData.onGameFinish.players);
    }
  }, [gameFinishData]);

  // 画面ロード時もゲーム終了してたら結果を表示する
  useEffect(() => {
    if (roomData && !roomLoading && roomData.getRoom) {
      if (roomData.getRoom.endGame) {
        setGameResults(roomData.getRoom.players);
      }
    }
    if (roomError) {
      console.error('Failed to fetch room data:', roomError);
    }
  }, [roomData, roomLoading, roomError]);

  // 管理者からキックされた場合はトップに戻る
  useEffect(() => {
    if (playerKickedData && playerKickedData.onPlayerKicked === playerId) {
      alert('あなたは追放されました。');
      localStorage.removeItem('playerId');
      setTimeout(() => navigate('/'), 100); // alertが出ないんで遅延させとく
    }
  }, [playerKickedData, playerId, navigate]);

  const handleVote = () => {
    if (voteTarget) {
      votePlayer({ variables: { playerId, voteTarget } })
        .then(response => {
          alert('投票が完了しました');
          console.log('Vote successful:', response);
        })
        .catch(err => {
          console.error('Failed to vote:', err);
        });
    } else {
      console.warn('No vote target specified');
    }
  };

  const mitsuElements = useMemo(() => {
    return [...Array(550)].map((_, index) => {
      const randomX = Math.random();
      const randomY = Math.random();
      return (
        <div
          key={index}
          className="mitsu"
          style={{ '--random-x': randomX, '--random-y': randomY, '--random-delay': Math.floor(Math.random() * 10) } as React.CSSProperties}
        ></div>
      );
    });
  }, []);
  
  return (
    <div className="dashboard-container">
      <div className="background-animation">
        {mitsuElements}
      </div>
      <div className="dashboard-header">
        <h1>🎉 ようこそ {playerName} ちゃん 🎉</h1>
        {word ? (
          <>
            <h2>↓😘ワードが来たょやったネ😘↓</h2>
            <div className="word-box">{word}</div>
          </>
        ) : (
          <h2>まだワードは配られてないネ😢</h2>
        )}
      </div>
      <div className="vote-section">
        <input
          type="text"
          className="vote-input"
          value={voteTarget}
          onChange={(e) => setVoteTarget(e.target.value)}
          placeholder="投票対象者"
        />
        <button className="vote-button" onClick={handleVote}>投票する</button>
      </div>
      {gameResults.length > 0 && (
        <div className="results-section">
          <h2>🎊 ゲームの結果 🎊</h2>
          <ul className="results-list">
            {gameResults.map((player, index) => (
              <li key={index} className="results-item">{player.name} → {player.voteTarget}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlayerDashboard;
