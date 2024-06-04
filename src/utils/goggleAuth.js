import { gapi } from 'gapi-script';
import { clientId, API_KEY } from '../config/key';


const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const initGoogleAPI = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('client:auth2', {
          callback: () => {
            gapi.client.init({
              apiKey: API_KEY,
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

