import { gql } from '@apollo/client';

// プレイヤーをルームに参加させる
export const JOIN_ROOM = gql`
  mutation JoinRoom($roomId: ID!, $name: String!) {
    joinRoom(roomId: $roomId, name: $name) {
      id
      name
    }
  }
`;

// プレイヤーが投票を行う
export const VOTE_PLAYER = gql`
  mutation votePlayer($playerId: ID!, $voteTarget: String!) {
    votePlayer(playerId: $playerId, voteTarget: $voteTarget) {
      id
      name
      voteTarget
    }
  }
`;

// ワードを配布する（管理者のみ）
export const DISTRIBUTE_WORDS = gql`
  mutation AssignWordToPlayer($input: WordToPlayerInput!) {
    assignWordToPlayer(input: $input) {
      id
      name
      word
    }
  }
`;

// ゲーム終了フラグの変更
export const SET_END_GAME = gql`
  mutation setEndGame($roomId: ID!, $endGame: Boolean!) {
    setEndGame(roomId: $roomId, endGame: $endGame) {
      endGame
      players {
        id
        name
        voteTarget
      }
    }
  }
`;

// プレイヤーをルームから削除する（管理者のみ）
export const KICK_PLAYER = gql`
  mutation KickPlayer($playerId: ID!) {
    kickPlayer(playerId: $playerId)
  }
`;