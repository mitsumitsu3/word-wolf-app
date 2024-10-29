import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, split } from '@apollo/client';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';

// ビルド時にどのみち混じるしリソース毎回消すのでベタがき
const apiKey = 'xxx-xxxxxxxxxxxxxxxxxxxxxx';
const url = 'https://xxxxxxxxxxx.appsync-api.ap-northeast-1.amazonaws.com/graphql';
const region = "ap-northeast-1";

const defaultAuth = {
  type: 'API_KEY' as const,
  apiKey: apiKey,
};

const httpLink = new HttpLink({ uri: url });

const createDynamicAuthLink = () => {
  return setContext((_, { headers = {}, authType }) => {
    const token = localStorage.getItem('jwtToken');

    if (authType === 'JWT' && token) {
      // JWTトークン認証
      const { 'x-api-key': _, ...restHeaders } = headers;
      return {
        headers: {
          ...restHeaders,
          Authorization: `Bearer ${token}`,
        },
      };
    } else {
      // デフォルトはAPIキー認証
      const { Authorization, ...restHeaders } = headers;
      return {
        headers: {
          ...restHeaders,
          'x-api-key': apiKey,
        },
      };
    }
  });
};

// WebSocketリンクを認証方式に応じて動的に作成
const createDynamicSubscriptionLink = () => {
  const token = localStorage.getItem('jwtToken') || ''; // トークンが存在しない場合は空文字列を使用
  const authType = token ? 'AMAZON_COGNITO_USER_POOLS' : 'API_KEY';

  const auth =
    authType === 'AMAZON_COGNITO_USER_POOLS'
      ? { type: 'AMAZON_COGNITO_USER_POOLS' as const, jwtToken: token }
      : { type: 'API_KEY' as const, apiKey: apiKey };

  return createSubscriptionHandshakeLink({ url, region, auth }, httpLink);
};

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  createDynamicSubscriptionLink(), // サブスクリプションリンクを動的に作成
  httpLink
);

const client = new ApolloClient({
  link: ApolloLink.from([createDynamicAuthLink(), splitLink]),
  cache: new InMemoryCache(),
});

export default client;
