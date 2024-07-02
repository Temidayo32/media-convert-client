import { Client } from '@microsoft/microsoft-graph-client';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export const getAuthenticatedClient = async (msalInstance) => {
  if (!msalInstance) {
    console.error('MSAL instance not initialized');
    return null;
  }

  const graphClient = Client.initWithMiddleware({
    authProvider: async (done) => {
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length === 0) {
        await msalInstance.loginPopup();
      } else {
        const accessTokenRequest = {
          scopes: ['https://graph.microsoft.com/.default'],
          account: accounts[0],
        };

        try {
          const response = await msalInstance.acquireTokenSilent(accessTokenRequest);
          const token = response.accessToken;
          done(null, token);
        } catch (error) {
          if (error instanceof InteractionRequiredAuthError) {
            await msalInstance.acquireTokenRedirect(accessTokenRequest);
          }
        }
      }
    },
  });

  return graphClient;
};
