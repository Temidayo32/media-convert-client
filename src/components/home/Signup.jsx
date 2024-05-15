import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SignUpWithGoogle from './SignUpWithGoogle';
import SignUpWithEmail from './SignUpWithEmail';

function Signup({ showLogin, show, onClose, setUserCredentials, closeSignUpAndShowSuccess  }) {
    const signUpRef = useRef(null);

    // useEffect(() => {
    //     function closeModal(event) {
    //       if (signUpRef.current && !signUpRef.current.contains(event.target) && !event.target.classList.contains("signUpRef")) {
    //         onClose();
    //       }
    //     }
    //     const close = document.querySelector('#closeSignUp')
    //     if (close) {
    //       close.addEventListener("click", closeModal);
    //       return () => {
    //           close.removeEventListener("click", closeModal);
    //       };
    //     }
    //   }, [signUpRef]);
    const handleClick = (e) => {
      if (e.target.id === 'closeSignUp') {
        onClose();
      }
    };
  
    return (
      <div>
        {show && (
            <div id='closeSignUp' onClick={handleClick} className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
              <div ref={signUpRef} className="bg-white p-12 h-4/5 w-2/5 rounded-lg shadow-xl">
                <div className="mb-12 text-center"><p className="font-weight-bold text-3xl mb-0">Create your account</p></div>
                <div className="mb-4 w-100 text-center">
                  <SignUpWithGoogle />
                </div>
                <div>
                  <div class="mb-4 text-center py-2"><strong>Or sign up using your e-mail address:</strong></div>
                </div>
                <div>
                  <SignUpWithEmail setUserCredentials={setUserCredentials} closeSignUpAndShowSuccess={closeSignUpAndShowSuccess} />
                </div>
                <hr class="mb-4 mt-4"></hr>
                <div class="text-center">
                  Already have an account?  <button className="text-teal-500 hover:text-teal-300 transition-colors duration-300" onClick={showLogin} >Log In</button>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }
  
  export default Signup;
