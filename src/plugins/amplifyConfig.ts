import {
  API_BASE_URL,
  AWS_REGION,
  COGNITO_APP_DOMAIN,
  COGNITO_CLIENT_ID,
  COGNITO_REDIRECT_SIGN_IN,
  COGNITO_REDIRECT_SIGN_OUT,
  COGNITO_USERPOOL_ID
} from '@/constants/aws';
import type { ResourcesConfig } from 'aws-amplify';

const amplifyConfiguration: ResourcesConfig = {
  API: {
    REST: {
      apiName: {
        endpoint: API_BASE_URL,
        region: AWS_REGION
      }
    }
  },
  Auth: {
    Cognito: {
      userPoolId: COGNITO_USERPOOL_ID,
      userPoolClientId: COGNITO_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: COGNITO_APP_DOMAIN,
          scopes: ['openid', 'email', 'aws.cognito.signin.user.admin', 'profile'],
          redirectSignIn: [COGNITO_REDIRECT_SIGN_IN],
          redirectSignOut: [COGNITO_REDIRECT_SIGN_OUT],
          responseType: 'code'
        }
      }
    }
  }
};

export { amplifyConfiguration };
