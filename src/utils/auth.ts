import { gapi } from 'gapi-script';
import { clientId, API_KEY, developerKey, dropboxAppKey  } from '../config/key';
import { DropboxAuth, DropboxResponse } from 'dropbox';


const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DROPBOX_CLIENT_ID =  dropboxAppKey;
const STATE = 'random_string';
const DROPBOX_REDIRECT_URI = 'http://localhost:3000';

export const initGoogleAPI = (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      (window as any).gapi.load('client:auth2', {
        callback: () => {
          (window as any).gapi.client.init({
            apiKey: developerKey,
            clientId: clientId,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            scope: SCOPES
          }).then(() => {
            console.log('Google API initialized');
            resolve();
          }).catch((error: Error) => {
            console.error('Error initializing Google API:', error);
            reject(error);
          });
        },
        onerror: (error: Error) => {
          console.error('Error loading Google API:', error);
          reject(error);
        }
      });
    };
    script.onerror = (error: Event | string) => {
      console.error('Error loading Google API:', error);
      reject(error instanceof Error ? error : new Error('Unknown error loading Google API'));
    };
    document.body.appendChild(script);
  });
};


export const handleGoogleAuth = async (): Promise<string | null> => {
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
  

  export const handleDropboxAuth = async (): Promise<string> => {
    const dbx = new DropboxAuth({ clientId: DROPBOX_CLIENT_ID });
  
    const authUrl = await dbx.getAuthenticationUrl(
      DROPBOX_REDIRECT_URI,
      STATE,
      'code',
      'offline',
      undefined,
      'none',
      true
    );
  
    const authWindow = window.open(authUrl.toString(), '_blank', 'width=500,height=700')!;
  
    return new Promise<string>((resolve, reject) => {
      const interval = setInterval(() => {
        try {
          if (authWindow.closed) {
            clearInterval(interval);
            reject(new Error('Popup closed by user'));
          }
  
          const authUrl = new URL(authWindow.location.href);
          if (
            authUrl.origin === window.location.origin &&
            authUrl.searchParams.get('code') &&
            authUrl.searchParams.get('state') === STATE
          ) {
            const code = authUrl.searchParams.get('code');
            authWindow.close();
            clearInterval(interval);
  
            if (code) {
              dbx
              .getAccessTokenFromCode(DROPBOX_REDIRECT_URI, code)
              .then((response: DropboxResponse<any>) => {
                console.log(response)
                const token = response.result.access_token as string; // Adjust this according to DropboxResponse structure
                resolve(token);
              })
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