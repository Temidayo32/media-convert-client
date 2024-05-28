import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMail } from 'react-icons/hi';
import { RiLockPasswordLine } from 'react-icons/ri';
import { CgSpinner } from "react-icons/cg";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

function LoginWithEmail({ onForgotPasswordClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const signInWithEmailAndPassword = () => {
    setIsLoading(true);
    firebase.auth().signInWithEmailAndPassword(email, password).then((userCredentials) => {
      console.log(userCredentials.user);
    }).catch((error) => {
      console.error(error);
      setErrorMessage('Incorrect username or password');
    });
  };

  return (
    <div className="flex flex-col mt-8">
      <div className="flex items-center mb-8">
        <HiOutlineMail className="w-8 h-8 mr-2 text-gray-500" />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-full focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex items-center mb-8">
        <RiLockPasswordLine className="w-8 h-8 mr-2 text-gray-500" />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-full focus:outline-none focus:border-blue-500"
        />
      </div>
      {errorMessage && (
        <p className="text-red-500 mb-4 text-sm text-center">{errorMessage}</p>
      )}
      <button onClick={signInWithEmailAndPassword} disabled={isLoading} className="flex items-center justify-center  bg-teal-800 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400">
      {isLoading ? <CgSpinner className="animate-spin mr-2 size-6" /> : 'LOG IN'}
      </button>
      <div class="text-center text-teal-500 hover:text-teal-300 transition-colors duration-300 mb-2 mt-4">
        <Link onClick={onForgotPasswordClick}>Forgot Your Password?</Link>
      </div>
    </div>
  );
}

export default LoginWithEmail;
