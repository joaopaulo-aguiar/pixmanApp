import { ResourcesConfig } from 'aws-amplify';
import { config } from './config';

/**
 * Debug version of AWS Amplify configuration for AppSync GraphQL API with Cognito Identity Pool
 */
export const amplifyConfigDebug: ResourcesConfig = {
  Auth: {
    Cognito: {
      identityPoolId: config.aws.identityPoolId,
      allowGuestAccess: true, // Permite acesso anônimo
    },
  },
  API: {
    GraphQL: {
      endpoint: config.api.graphqlUrl,
      region: config.aws.region,
      defaultAuthMode: 'identityPool', // Mudança de 'apiKey' para 'identityPool'
    },
  },
};

console.log('🔧 Amplify Config Debug:', {
  identityPoolId: config.aws.identityPoolId,
  graphqlUrl: config.api.graphqlUrl,
  region: config.aws.region,
});

export default amplifyConfigDebug;
