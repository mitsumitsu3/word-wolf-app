import React, { useEffect, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_ROOM } from '../graphql/queries';
import { ON_GAME_FINISH } from '../graphql/subscriptions';
import '../css/wolf_style.css';

// プレイヤーの型定義
interface Player {
  id: string;
  name: string;
  word?: string;
  voteTarget?: string;
}

const AdminDashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isPlayerRestricted, setIsPlayerRestricted] = useState(false);
  const navigate = useNavigate();
  const [gameResults, setGameResults] = useState<{ name: string; voteTarget: string }[]>([]);
  const { data: gameFinishData } = useSubscription(ON_GAME_FINISH);

  // playerの場合はこの画面は見れないように
  useEffect(() => {
    const playerId = localStorage.getItem('playerId');
    if (playerId) {
      setIsPlayerRestricted(true);
    }
  }, [navigate]);

  // クエリ（ルーム情報を取得）
  const { data: roomData, loading: roomLoading, error: roomError } = useQuery(GET_ROOM, {
    variables: { roomId: 'room1' },
  });

  // ルーム情報をロードしたときの処理
  useEffect(() => {
    if (roomData && roomData.getRoom) {
      setPlayers(roomData.getRoom.players.map((player: Player) => ({ ...player })));
    }
  }, [roomData]);

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
  
  if (isPlayerRestricted) return <p>プレイヤーはこの画面は見れません！！見ようとするなんて最低ですよホント</p>;
  if (roomLoading) return <p>読み込み中...</p>;
  if (roomError) return <p>エラーが発生しました: {roomError.message}</p>;

  return (
    <div className="dashboard-container">
      <div className="background-animation">
        {[...Array(150)].map((_, index) => {
          const randomX = Math.random();
          const randomY = Math.random();
          return (
            <div
              key={index}
              className="mitsu"
              style={{ '--random-x': randomX, '--random-y': randomY } as React.CSSProperties}
            ></div>
          );
        })}
      </div>
      <div className="dashboard-header">
        <h1>🎉 ようこそ 🎉</h1>
      </div>
      <div className="player-list-section">
        <h2>↓参加者のやろーども↓</h2>
        <table className="player-table">
          <thead>
            <tr>
              <th className="player-table-header">名前</th>
              <th className="player-table-header">ワード</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="player-table-row">
                <td className="player-table-cell player-name">{player.name}</td>
                <td className="player-table-cell">{player.word || 'なし'}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default AdminDashboard;
