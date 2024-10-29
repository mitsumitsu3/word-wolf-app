import { gql } from '@apollo/client';

// プレイヤーがルームに参加したときに通知を受け取る
export const ON_PLAYER_JOINED = gql`
  subscription OnPlayerJoined {
    onPlayerJoined {
      id
      name
    }
  }
`;

// 管理者がワードを配布したときに通知を受け取る
export const ON_WORDS_DISTRIBUTED = gql`
  subscription OnWordsDistributed {
    onWordsDistributed {
        id
        name
        word
    }
  }
`;

// プレイヤーが投票したときに通知を受け取る
export const ON_PLAYER_VOTED = gql`
  subscription OnPlayerVoted {
    onPlayerVoted {
      id
      name
      voteTarget
    }
  }
`;

// ゲームが終了した時に通知を受け取る
export const ON_GAME_FINISH = gql`
  subscription OnGameFinish {
    onGameFinish {
      endGame
      players {
        id
        name
        voteTarget
      }
    }
  }
`;

export const ON_PLAYER_KICKED = gql`
  subscription OnPlayerKicked {
    onPlayerKicked
  }
`;