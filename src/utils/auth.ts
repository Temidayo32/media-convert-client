import { gapi } from 'gapi-script';
import { authClientId, clientId, API_KEY, developerKey, dropboxAppKey  } from '../config/key';
import { DropboxAuth, DropboxResponse } from 'dropbox';
import { Firestore, collection, query, where, getDocs, setDoc, doc, writeBatch, getDoc, deleteDoc, QuerySnapshot, DocumentData } from "firebase/firestore";
import { User, UserCredential, Auth, signInWithCredential, AuthCredential } from "firebase/auth";
import { Task } from '../typings/types';



const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DROPBOX_CLIENT_ID =  dropboxAppKey;
const STATE = 'random_string';
const DROPBOX_REDIRECT_URI =  `${process.env.REACT_APP_BASE_FRONTEND}/callback`//'http://localhost:3000';

export const validateEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  return passwordRegex.test(password);
};

export const handleGoogleSignIn = async (): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      console.log('Google API script loaded.');
      (window as any).gapi.load('client:auth2', {
        callback: () => {
          (window as any).gapi.auth2.init({
            clientId: authClientId,
          }).then(() => {
            (window as any).gapi.auth2.getAuthInstance().signIn().then((googleUser: any) => {
              resolve(googleUser); // Resolve with googleUser
            }).catch((error: Error) => {
              reject(error);
            });
          }).catch((error: Error) => {
            reject(error);
          });
        },
        onerror: (error: Error) => {
          reject(error);
        }
      });
    };
    script.onerror = (error: Event | string) => {
      console.error('Error loading Google API script:', error);
      reject(error instanceof Error ? error : new Error('Unknown error loading Google API'));
    };
    document.body.appendChild(script);
  });
};


export const initGoogleAPI = async (): Promise<void> => {
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
      console.log('Granted Scopes:', grantedScopes);
      
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
      DROPBOX_REDIRECT_URI!,
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
            // new Error('Popup closed by user');
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
              .getAccessTokenFromCode(DROPBOX_REDIRECT_URI!, code)
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
  
export async function handleAnonymousUpgradeMergeConflict(
  db: Firestore,
  auth: Auth,
  user: User,
  credential: AuthCredential,
  setIsLoading?: (isLoading: boolean) => void
): Promise<void> {
  const anonymousUserId = user.uid;

  try {
    // Step 1: Copy anonymous user's tasks to a temporary location
    const anonymousTasksRef = query(collection(db, 'tasks'), where('userId', '==', anonymousUserId));
    const temporaryTasksRef = doc(collection(db, 'temporaryTasks'), anonymousUserId);

    // Fetch all tasks for the anonymous user
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(anonymousTasksRef);
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push(doc.data() as Task);
    });

    // Store anonymous tasks temporarily
    await setDoc(temporaryTasksRef, { tasks });
    console.log('Step 1');

    // Step 2: Delete the original anonymous user's tasks
    const batchDelete = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batchDelete.delete(doc.ref);
    });
    await batchDelete.commit();
    console.log('Step 2');

    // Step 3: Sign in with the permanent credential
    const userCredential: UserCredential = await signInWithCredential(auth, credential);
    const permanentUserId = userCredential.user.uid;

    // Step 4: Transfer tasks back from temporary location to permanent user
    const docSnapshot = await getDoc(temporaryTasksRef);
    console.log('Step 3');
    const temporaryTasks = docSnapshot.data()?.tasks as Task[];

    // Update userId field for each task
    const batch = writeBatch(db);
    temporaryTasks.forEach((task) => {
      const newTaskRef = doc(collection(db, 'tasks'));
      task.userId = permanentUserId;
      batch.set(newTaskRef, task);
    });

    // Commit the batch operation
    await batch.commit();
    console.log('Step 4');

    // Step 5: Clean up temporary data
    await deleteDoc(temporaryTasksRef);

    console.log('Anonymous user tasks transferred and updated successfully');
  } catch (error) {
    console.error('Error during anonymous upgrade merge conflict handling:', error);
    if(setIsLoading) {
      setIsLoading(false);
    }
  }
}