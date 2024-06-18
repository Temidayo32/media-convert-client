import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SignUpWithGoogle from './SignUpWithGoogle';
import SignUpWithEmail from './SignUpWithEmail';

function Signup({ showLogin, show, onClose, setUserCredentials, closeSignUpAndShowSuccess  }) {
    const signUpRef = useRef(null);

    
    const handleClick = (e) => {
      if (e.target.id === 'closeSignUp') {
        onClose();
      }
    };
  
    return (
      <div>
        {show && (
          <div
            id="closeSignUp"
            onClick={handleClick}
            className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20"
          >
            <div
              ref={signUpRef}
              className="bg-white p-8 sm:p-12 h-5/6 w-11/12 lg:h-4/5 md:w-2/3 lg:w-1/2 xl:w-2/5 rounded-lg shadow-xl"
            >
              <div className="mb-8 sm:mb-12 text-center">
                <p className="font-bold text-lg md:text-2xl mb-0">Create your account</p>
              </div>
              <div className="mb-4 w-full text-center">
                <SignUpWithGoogle />
              </div>
              <div>
                <div className="mb-4 text-sm md:text-base text-center py-2">
                  <strong>Or sign up using your e-mail address:</strong>
                </div>
              </div>
              <div>
                <SignUpWithEmail setUserCredentials={setUserCredentials} closeSignUpAndShowSuccess={closeSignUpAndShowSuccess} />
              </div>
              <hr className="mb-4 mt-4"></hr>
              <div className="text-center text-sm md:text-base">
                Already have an account?{' '}
                <button
                  className="text-teal-500 hover:text-teal-300 transition-colors duration-300"
                  onClick={showLogin}
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default Signup;
