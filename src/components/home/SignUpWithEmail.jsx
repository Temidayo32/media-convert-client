import React, { useState } from 'react';
import { HiOutlineMail } from 'react-icons/hi';
import { RiLockPasswordLine, RiLockPasswordFill } from 'react-icons/ri';
import { CgSpinner } from "react-icons/cg";

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getAuth,linkWithCredential, EmailAuthProvider } from "firebase/auth";
import { validateEmail, validatePassword } from '../../utils/auth';
import { useData } from '../../DataContext';

function SignUpWithEmail({setUserCredentials, closeSignUpAndShowSuccess}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {setIdToken, setShowUser, setShowSignUpOptions} = useData();

  const auth = getAuth();
  const user = auth.currentUser;

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

    try {
      if (user && user.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);

        linkWithCredential(user, credential)
          .then((userCredentials) => {
            setShowUser(true);
            setShowSignUpOptions(false)
            closeSignUpAndShowSuccess();
            setIdToken(userCredentials.user.accessToken);
            console.log("Anonymous account successfully upgraded");
            setUserCredentials(userCredentials.user)
          }).catch((error) => {
            console.log("Error upgrading anonymous account", error);
          });
      } else {
        firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
          setUserCredentials(userCredential.user);
          closeSignUpAndShowSuccess();
          })
          .catch((error) => {
            console.error(error);
          })
      }

  } catch(error) {
    console.error(error)
  } finally {
    setIsLoading(false);
  };
}



  return (
    <div className="flex flex-col mt-4">
      <div className="flex items-center mb-2 md:mb-4">
        <HiOutlineMail className="w-8 h-8 mr-2 text-gray-500 lg:w-10 lg:h-10" />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          className={`border ${emailError ? 'border-red-500' : 'border-gray-300'} px-2 py-1 md:px-4 md:py-2 rounded w-full focus:outline-none focus:border-blue-500 text-xs md:text-base lg:text-lg`}
        />
      </div>
      {emailError && <p className="text-red-500  text-xs md:text-sm mb-2">{emailError}</p>}
      <div className="flex items-center mb-2 md:mb-4">
        <RiLockPasswordLine className="w-8 h-8 mr-2 text-gray-500 lg:w-10 lg:h-10" />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          data-testid='Password Set'
          className={`border ${passwordError || !passwordsMatch ? 'border-red-500' : 'border-gray-300'} px-2 py-1 md:px-4 md:py-2 rounded w-full focus:outline-none focus:border-blue-500 text-xs md:text-base lg:text-lg`}
        />
      </div>
      {passwordError && <p className="text-red-500 text-xs md:text-sm mb-2">{passwordError}</p>}
      <div className="flex items-center mb-2 md:mb-4">
        <RiLockPasswordFill className="w-8 h-8 mr-2 text-gray-500  lg:w-10 lg:h-10" />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          className={`border ${passwordError || !passwordsMatch ? 'border-red-500' : 'border-gray-300'} px-2 py-1 md:px-4 md:py-2 rounded w-full focus:outline-none focus:border-blue-500 text-xs md:text-base lg:text-lg`}
        />
      </div>
      {!passwordsMatch && <p className="text-red-500 text-xs md:text-sm">Passwords don't match</p>}
      <button
        onClick={signUpWithEmailAndPassword}
        className="flex items-center justify-center text-xs md:text-base bg-teal-800 hover:bg-teal-500 text-white font-bold py-1 px-2  md:py-2 md:px-4 rounded transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
        disabled={isLoading || !!emailError || !!passwordError || !passwordsMatch}
      >
        {isLoading ? <CgSpinner className="animate-spin mr-2 size-4 md:size-6" /> : 'SIGN UP'}
      </button>
    </div>
  );
};

export default SignUpWithEmail;
