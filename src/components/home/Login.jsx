import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignUpWithGoogle from './SignUpWithGoogle';
import LoginWithEmail from './LoginWithEmail';

function Login({onForgotPasswordClick, show, onClose, showSignUp }) {
    const loginRef = useRef(null);

  //   useEffect(() => {
  //     function closeModal(event) {
  //         if (loginRef.current && !loginRef.current.contains(event.target) && !event.target.classList.contains("loginRef")) {
  //             onClose();
  //         }
  //     }

  //     const close = document.querySelector('#closeLogin')
  //     if (close) {
  //       close.addEventListener("click", closeModal);
  //       return () => {
  //           close.removeEventListener("click", closeModal);
  //       };
  //   }
  // }, [loginRef, onClose]);
    const handleClick = (e) => {
      if (e.target.id === 'closeLogin') {
        onClose();
      }
    };
  
    return (
      <div>
        {show && (
        <div id='closeLogin' class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20" onClick={handleClick}>
            <div ref={loginRef} className="bg-white p-8 sm:p-12 h-8/12 md:h-1/2 w-10/12 lg:h-fit md:w-2/3 lg:w-1/2 xl:w-2/5 rounded-lg shadow-xl">
            <div class="mb-12 text-center"><p className="font-weight-bold text-lg md:text-2xl mb-0">Log In</p></div>
            <div class="mb-4 w-100 text-center">
                <SignUpWithGoogle />
            </div>
            <div>
                <div class="mb-4 text-sm md:text-base text-center py-2"><strong>Or</strong></div>
            </div>
            <div>
                <LoginWithEmail onForgotPasswordClick={onForgotPasswordClick} />
            </div>
            <hr class="mb-4 mt-4"></hr>
            <div class="text-center text-sm md:text-base">
                Don't have an account yet? <Link onClick={showSignUp} className='text-teal-500 hover:text-teal-300 transition-colors duration-300'>Sign Up</Link>
            </div>
            </div>
        </div>
        )}
      </div>
    );
  }
  
  export default Login;