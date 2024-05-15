import React, { useState } from 'react';
import { HiOutlineMail } from 'react-icons/hi';
import { RiLockPasswordLine, RiLockPasswordFill } from 'react-icons/ri';
import { CgSpinner } from "react-icons/cg";

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

function SignUpWithEmail({setUserCredentials, closeSignUpAndShowSuccess}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    if (emailError && validateEmail(value)) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setPassword(value);
    if (passwordError && validatePassword(value)) {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    setConfirmPassword(value);
    if (!passwordsMatch) {
      setPasswordsMatch(true);
    }
  };

  const signUpWithEmailAndPassword = () => {
    setEmailError('');
    setPasswordError('');

    let hasError = false;

    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    if (!password || !validatePassword(password)) {
      setPasswordError(
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      hasError = true;
    }

    if (hasError) return;

    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    setPasswordsMatch(true);
    setIsLoading(true);

    firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
        setUserCredentials(userCredential.user);
        closeSignUpAndShowSuccess();
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      setIsLoading(false);
    })
  };

  return (
    <div className="flex flex-col mt-4">
      <div className="flex items-center mb-4">
        <HiOutlineMail className="w-8 h-8 mr-2 text-gray-500" />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          className={`border ${emailError ? 'border-red-500' : 'border-gray-300'} px-4 py-2 rounded w-full focus:outline-none focus:border-blue-500`}
        />
      </div>
      {emailError && <p className="text-red-500 text-sm mb-2">{emailError}</p>}
      <div className="flex items-center mb-4">
        <RiLockPasswordLine className="w-8 h-8 mr-2 text-gray-500" />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          className={`border ${passwordError || !passwordsMatch ? 'border-red-500' : 'border-gray-300'} px-4 py-2 rounded w-full focus:outline-none focus:border-blue-500`}
        />
      </div>
      {passwordError && <p className="text-red-500 text-sm mb-2">{passwordError}</p>}
      <div className="flex items-center mb-4">
        <RiLockPasswordFill className="w-8 h-8 mr-2 text-gray-500" />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          className={`border ${passwordError || !passwordsMatch ? 'border-red-500' : 'border-gray-300'} px-4 py-2 rounded w-full focus:outline-none focus:border-blue-500`}
        />
      </div>
      {!passwordsMatch && <p className="text-red-500 text-sm">Passwords don't match</p>}
      <button 
        onClick={signUpWithEmailAndPassword} 
        className="flex items-center justify-center bg-teal-800 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
        disabled={isLoading || !!emailError || !!passwordError || !passwordsMatch}>
          {isLoading ? <CgSpinner className="animate-spin mr-2 size-6" /> : 'SIGN UP'}
      </button>
    </div>
  );
}

export default SignUpWithEmail;
