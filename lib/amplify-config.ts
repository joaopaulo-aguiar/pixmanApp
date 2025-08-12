import { ResourcesConfig } from 'aws-amplify';
import { config } from './config';

/**
 * AWS Amplify configuration for AppSync GraphQL API with Cognito Identity Pool
 */
export const amplifyConfig: ResourcesConfig = {
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

export default amplifyConfig;
