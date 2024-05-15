// LoginWithGoogle.jsx
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

function SignUpWithGoogle() {
  const signInWithGoogle = () => {
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((userCredentials) => {
      console.log(userCredentials);
    }).catch((error) => {
      console.error(error);
    });
  };

  return (
    <button onClick={signInWithGoogle} className="flex items-center justify-center bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-2 px-4 mb-4 w-full rounded shadow transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500">
      <FcGoogle className="w-5 h-5 mr-2" />
      <span className='text-xl'>Continue with Google</span>
    </button>
  );
}

export default SignUpWithGoogle;