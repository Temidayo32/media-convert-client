import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMail } from 'react-icons/hi';
import { RiLockPasswordLine } from 'react-icons/ri';
import { CgSpinner } from "react-icons/cg";
import { getAuth, EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { handleAnonymousUpgradeMergeConflict } from '../../utils/auth';
import { db } from '../../config/firebase_config';
import { useData } from '../../DataContext';

function LoginWithEmail({ onForgotPasswordClick }) {
  const { setOpen } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;


  const signInWithEmailAndPassword = () => {
    setIsLoading(true);

    // Check if the current user is anonymous
    if (user && user.isAnonymous) {
      // Handle upgrade merge conflict if the user is anonymous
      handleAnonymousUserUpgrade(user);
    } else {
      // Proceed with normal email/password sign-in
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredentials) => {
          console.log(userCredentials.user);
        })
        .catch((error) => {
          console.error(error);
          setErrorMessage('Incorrect username or password');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  async function handleAnonymousUserUpgrade(currentUser) {
    const credential = EmailAuthProvider.credential(email, password);
    console.log(credential)
  
     // Proceed to link the anonymous user with the new credentials
     await linkWithCredential(currentUser, credential)
     .then(async (userCredential) => {
         console.log('Anonymous user upgraded:', userCredential.user);

         // Handle data migration after linking credentials
         await handleAnonymousUpgradeMergeConflict(db, auth, user, userCredential.credential, setIsLoading);
     })
     .catch(async (error) =>  {
         if (error.code === 'auth/credential-already-in-use' || 'auth/email-already-in-use') {
             // Handle the merge conflict
             await handleAnonymousUpgradeMergeConflict(db, auth, user, credential, setIsLoading);
         } else if (error.code === 'auth/operation-not-allowed') {
          // Handle the case where email verification is required
          console.log(error)
          console.error('Email verification required before linking.');
          setErrorMessage('Please check your inbox and verify your email address.');
          setOpen(true);
        } else {
            // Handle other errors
            console.error('Error linking anonymous account:', error);
            setErrorMessage('Could not link anonymous account. Please try again.');
        }
      setIsLoading(false);
     });
  }
  

  return (
    <div className="flex flex-col mt-4 md:mt-8 z-50">
      <div className="flex items-center mb-2 md:mb-4">
        <HiOutlineMail className="w-8 h-8 mr-2 text-gray-500 sm:w-2 sm:h-2 md:w-8 md:h-8 lg:w-10 lg:h-10" />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 px-2 py-1 md:px-4 md:py-2 rounded w-full focus:outline-none focus:border-blue-500 text-xs md:text-base lg:text-lg"
        />
      </div>
      <div className="flex items-center mb-2 md:mb-4">
        <RiLockPasswordLine className="w-8 h-8 mr-2 text-gray-500 sm:w-2 sm:h-2 md:w-8 md:h-8 lg:w-10 lg:h-10" />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 px-2 py-1 md:px-4 md:py-2 rounded w-full focus:outline-none focus:border-blue-500 text-xs md:text-base lg:text-lg"
        />
      </div>
      {errorMessage && (
        <p className="text-red-500 mb-4 text-xs md:text-sm text-center">{errorMessage}</p>
      )}
      <button onClick={signInWithEmailAndPassword} disabled={isLoading} className="flex items-center justify-center text-xs md:text-base bg-teal-800 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400">
      {isLoading ? <CgSpinner className="animate-spin mr-2 size-4 md:size-6" /> : 'LOG IN'}
      </button>
      <div className="text-center text-sm md:text-base text-teal-500 hover:text-teal-300 transition-colors duration-300 mb-2 mt-4">
        <Link onClick={onForgotPasswordClick}>Forgot Your Password?</Link>
      </div>
    </div>
  );
}

export default LoginWithEmail;
