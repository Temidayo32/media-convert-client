import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import  { useData } from '../../DataContext';
import { handleGoogleSignIn } from '../../utils/auth';
import { GoogleAuthProvider, getAuth,  linkWithCredential  } from 'firebase/auth';
import { setLocalStorageItem } from '../../utils/localStorage';
import { handleAnonymousUpgradeMergeConflict } from '../../utils/auth';
import { db } from '../../config/firebase_config';

function SignUpWithGoogle() {
  const { setIdToken, setShowUser, setShowSignUpOptions } = useData();
  const auth = getAuth()
  const user = auth.currentUser;
  

  // Function to get Google credential
  const getGoogleCredential = async () => {
    return handleGoogleSignIn().then((googleUser) => {
      const idToken = googleUser.getAuthResponse().id_token;
      const credential = GoogleAuthProvider.credential(idToken);
      return credential;
    });
  };

  
  const signInWithGoogle = async () => {
    try {
      if (user && user.isAnonymous) {
        const credential = await getGoogleCredential();

        try {
          const userCredentials = await linkWithCredential(user, credential);
          setShowUser(true);
          setShowSignUpOptions(false);
          setLocalStorageItem('userCredentials', userCredentials);
          console.log("Anonymous account successfully upgraded");
        } catch (error) {
          if (error.code === 'auth/credential-already-in-use') {
            await handleAnonymousUpgradeMergeConflict(db, auth, user, credential);
          } else {
            console.log("Error upgrading anonymous account", error);
          }
        }
      } else {
        firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((userCredentials) => {
          setIdToken(userCredentials.credential.idToken);
        }).catch((error) => {
          console.error(error);
        });
      }
    } catch(error) {
      console.error(error)
    }
    
  };

  return (
    <button onClick={signInWithGoogle} className="flex items-center justify-center bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-2 px-4 mb-4 w-full rounded shadow transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500">
      <FcGoogle className="w-5 h-5 mr-2" />
      <span className='text-base md:text-xl'>Continue with Google</span>
    </button>
  );
}

export default SignUpWithGoogle;