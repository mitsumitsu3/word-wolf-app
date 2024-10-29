import { gql } from '@apollo/client';

// 特定のルーム情報を取得する
export const GET_ROOM = gql`
  query GetRoom($roomId: ID!) {
    getRoom(roomId: $roomId) {
      roomId
      endGame
      players {
        id
        name
        word
        voteTarget
      }
    }
  }
`;

// すべてのルームを一覧取得する
export const LIST_ROOMS = gql`
  query ListRooms {
    listRooms {
      roomId
      wordDistributed
    }
  }
`;

// 特定のプレイヤー情報を取得する
export const GET_PLAYER = gql`
  query GetPlayer($playerId: ID!) {
    getPlayer(playerId: $playerId) {
      id
      name
      word
    }
  }
`;
