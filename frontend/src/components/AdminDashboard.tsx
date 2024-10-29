import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_ROOM } from '../graphql/queries';
import { DISTRIBUTE_WORDS, SET_END_GAME, KICK_PLAYER } from '../graphql/mutations';
import { ON_PLAYER_JOINED, ON_PLAYER_VOTED } from '../graphql/subscriptions';
import '../css/wolf_style.css';

// プレイヤーの型定義ここでしとく
interface Player {
  id: string;
  name: string;
  word?: string;
  voteTarget?: string;
}

const AdminDashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const navigate = useNavigate();

  // AppSyncの認証設定（CognitoのJWT認証）
  const contextWithJWT = { 
    authType: 'JWT',
  };

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // クエリ（ルーム情報を取得）
  const { data: roomData, loading: roomLoading, error: roomError, refetch: refetchRoom } = useQuery(GET_ROOM, {
    variables: { roomId: 'room1' },
  });

  // ミューテーション
  const [assignWordToPlayer] = useMutation(DISTRIBUTE_WORDS, { context: contextWithJWT });
  const [endGame] = useMutation(SET_END_GAME, { context: contextWithJWT });
  const [kickPlayer] = useMutation(KICK_PLAYER, { context: contextWithJWT });

  // サブスクリプション
  const { data: playerJoinedData } = useSubscription(ON_PLAYER_JOINED, { context: contextWithJWT });
  const { data: playerVotedData } = useSubscription(ON_PLAYER_VOTED, { context: contextWithJWT });

  // ルーム情報をロードしたときの処理
  useEffect(() => {
    if (roomData && roomData.getRoom) {
      setPlayers(roomData.getRoom.players.map((player: Player) => ({ ...player })));
    }
  }, [roomData]);

  // プレイヤーが参加した時の処理
  useEffect(() => {
    if (playerJoinedData) {
      const newPlayer: Player = playerJoinedData.onPlayerJoined;
      setPlayers((prevPlayers) => [...prevPlayers, { ...newPlayer }]);
    }
  }, [playerJoinedData]);

  // プレイヤーが投票した時の処理
  useEffect(() => {
    if (playerVotedData) {
      const { voterId, voteTarget } = playerVotedData.onPlayerVoted;
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === voterId ? { ...player, voteTarget } : player
        )
      );
    }
  }, [playerVotedData]);

  // ワードを配布する関数
  const handleDistributeWords = async () => {
    try {
      await Promise.all(players.map(async (player) => {
        await assignWordToPlayer({
          variables: {
            input: {
              playerId: player.id,
              word: player.word || '',
            },
          },
        });
      }));
      alert('ワードを配布しました');
      const updatedRoomData = await refetchRoom(); // 最新のルーム情報を再取得
      if (updatedRoomData.data && updatedRoomData.data.getRoom) {
        setPlayers(updatedRoomData.data.getRoom.players.map((player: Player) => ({ ...player })));
      }
    } catch (error) {
      console.error(`ワード割り当てエラー:`, error);
    }
  };

  // ゲームを終了する
  const handleEndGame = async () => {
    try {
      await endGame({ variables: { roomId: 'room1', endGame: true } });
      alert('ゲームを終了しました');
    } catch (error) {
      console.error('ゲーム終了エラー:', error);
      alert('ゲーム終了に失敗しました');
    }
  };

  // 全てのプレイヤーを削除
  const handleDeleteGame = async () => {
    try {
      await Promise.all(players.map(async (player) => {
        await kickPlayer({
          variables: {
            playerId: player.id,
          },
        });
      }));
      alert('全てのプレイヤーを削除しました');
      setPlayers([]); // プレイヤーリストクリア
    } catch (error) {
      console.error('プレイヤー削除エラー:', error);
      alert('プレイヤーの削除に失敗しました');
    }
    try {
      await endGame({ variables: { roomId: 'room1', endGame: false } });
      alert('ゲーム完了フラグを戻しました。');
    } catch (error) {
      console.error('ゲーム終了エラー:', error);
      alert('フラグ戻しに失敗しました');
    }

  };

  // 特定のプレイヤーを削除する関数
  const handleKickPlayer = async (playerId: string) => {
    if (window.confirm('このプレイヤーを削除してもよろしいですか？')) {
      try {
        await kickPlayer({ variables: { playerId } });
        alert('プレイヤーを削除しました');
        setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== playerId));
      } catch (error) {
        console.error('プレイヤー削除エラー:', error);
        alert('プレイヤーの削除に失敗しました');
      }
    }
  };

  if (roomLoading) return <p>読み込み中...</p>;
  if (roomError) return <p>エラーが発生しました: {roomError.message}</p>;

  return (
  
    <div className="dashboard-container admin-dashboard">
      <div className="dashboard-header">
        <h1>🛠 管理者ダッシュボード 🛠</h1>
      </div>
      <div className="results-section">
        <h2>参加者リスト</h2>
        <ul className="results-list">
          {players.map((player, index) => (
            <li key={player.id} className="results-item player-row">
              <div className="player-row-inner">
                <span className="player-info player-name">{player.name}</span>
                <span className="player-info">ワード:</span>
                <input
                  type="text"
                  className="vote-input smaller-input"
                  value={player.word || ''}
                  onChange={(e) => {
                    const updatedPlayers = players.map((p, i) =>
                      i === index ? { ...p, word: e.target.value } : p
                    );
                    setPlayers(updatedPlayers);
                  }}
                  placeholder="ワードを入力"
                />
                <span className="player-info">投票対象: {player.voteTarget || 'なし'}</span>
                <button className="vote-button kick-button" onClick={() => handleKickPlayer(player.id)}>削除</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="button-section button-column">
        <button className="vote-button" onClick={handleDistributeWords}>ワードを配布する</button>
        <button className="vote-button" onClick={handleEndGame}>ゲームを完了する</button>
        <button className="vote-button" onClick={handleDeleteGame}>全てを破壊する</button>
      </div>
    </div>

  );
};

export default AdminDashboard;
