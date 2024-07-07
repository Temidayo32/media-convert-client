import { gapi } from 'gapi-script';
import { clientId, API_KEY, developerKey } from '../config/key';
import { dropboxAppKey } from '../config/key';
import { DropboxAuth } from 'dropbox';


const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DROPBOX_CLIENT_ID =  dropboxAppKey;
const STATE = 'random_string';
const DROPBOX_REDIRECT_URI = 'http://localhost:3000';

export const initGoogleAPI = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('client:auth2', {
          callback: () => {
            gapi.client.init({
              apiKey: developerKey,
              clientId: clientId,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
              scope: SCOPES
            }).then(() => {
              console.log('Google API initialized');
              resolve();
            }).catch(error => {
              console.error('Error initializing Google API:', error);
              reject(error);
            });
          },
          onerror: (error) => {
            console.error('Error loading Google API:', error);
            reject(error);
          }
        });
      };
      script.onerror = (error) => {
        console.error('Error loading Google API:', error);
        reject(error);
      };
      document.body.appendChild(script);
    });
  };

export const handleGoogleAuth = async () => {
    try {
      console.log('Attempting Google authentication...');
      await initGoogleAPI();
      const authInstance = gapi.auth2.getAuthInstance();
      const authResult = await authInstance.signIn();
      
      // Check if the token has the required scopes
      const currentUser = authInstance.currentUser.get();
      const grantedScopes = currentUser.getGrantedScopes();
      // console.log('Granted Scopes:', grantedScopes);
      
      if (!grantedScopes.includes(SCOPES)) {
        console.error('Required scopes not granted.');
        return null;
      }
  
      const token = authResult.xc.access_token;
      console.log('OAuth Token:', token);
      return token;
    } catch (error) {
      console.error('Error during Google authentication:', error);
      return null;
    }
  };
  

export const handleDropboxAuth = async () => {
  const dbx = new DropboxAuth({ clientId: DROPBOX_CLIENT_ID });

  const authUrl = await dbx.getAuthenticationUrl(DROPBOX_REDIRECT_URI, STATE, 'code', 'offline', null, 'none', true);

  // console.log(authUrl)

  const authWindow = window.open(authUrl, '_blank', 'width=500,height=700');

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      try {
        if (authWindow.closed) {
          clearInterval(interval);
          reject(new Error('Popup closed by user'));
        }

        const authUrl = new URL(authWindow.location);
        // console.log(authUrl)
        if (authUrl.origin === window.location.origin && authUrl.searchParams.get('code')) {
          const code = authUrl.searchParams.get('code');
          const state = authUrl.searchParams.get('state');
          authWindow.close();
          clearInterval(interval);

          if (code && state === STATE) {
            dbx.getAccessTokenFromCode(DROPBOX_REDIRECT_URI, code)
              .then(token => resolve(token))
              .catch(reject);
          } else {
            reject(new Error('Authorization failed'));
          }
        }
      } catch (error) {
        // Ignore cross-origin errors until the popup redirects to the redirect URI
      }
    }, 2000);

    authWindow.onbeforeunload = () => {
      clearInterval(interval);
      reject(new Error('Popup closed by user'));
    };
  });
};