import { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } from '@aws-sdk/client-cognito-identity-provider';

const COGNITO_CLIENT_ID = 'xxxxxxxxxxxxxxxxxxxxxxxxxx';
const REGION = 'ap-northeast-1';

// サインイン処理
export const signIn = async (username: string, password: string) => {
  const client = new CognitoIdentityProviderClient({ region: REGION });

  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  });

  try {
    const response = await client.send(command);

    // パスワード再設定が必要な場合
    if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      const newPassword = prompt('新しいパスワードを入力してください:');
      if (!newPassword) {
        throw new Error('新しいパスワードが入力されていません');
      }

      const challengeCommand = new RespondToAuthChallengeCommand({
        ClientId: COGNITO_CLIENT_ID,
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        Session: response.Session,
        ChallengeResponses: {
          USERNAME: username,
          NEW_PASSWORD: newPassword,
        },
      });

      const newResponse = await client.send(challengeCommand);
      return newResponse.AuthenticationResult?.IdToken;
    }

    // 通常ログイン
    if (response.AuthenticationResult) {
      return response.AuthenticationResult.IdToken;
    } else {
      throw new Error('認証に失敗しました');
    }
  } catch (error) {
    console.error('サインインエラー:', error);
    throw new Error('ログインエラーが発生しました');
  }
};
