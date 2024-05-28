import React, { useState } from 'react'
import { Link } from 'react-router-dom';

import { MdMarkEmailRead } from "react-icons/md";
import { RiMailCloseLine } from "react-icons/ri";
import { FaArrowRight } from 'react-icons/fa';
import { CgSpinner } from "react-icons/cg";

import { getAuth, sendEmailVerification } from 'firebase/auth';

function EmailVerification({showMenu }) {
    const [verifyEmail, setVerifyEmail ] = useState(false);
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [showResentModal, setShowResentModal] = useState(false);
    const [error, setError] = useState(null);

    const auth = getAuth()
    const user = auth.currentUser

    if (user !== null && !email) {
        setEmail(user.email);
    }

    const handleSendVerificationEmail = () => {
        const actionCodeSettings = {
            url: `http://localhost:3000/verify-email?email=${encodeURIComponent(auth.currentUser.email)}`,
            handleCodeInApp: true
          };
        setIsLoading(true);
        sendEmailVerification(user, actionCodeSettings)
            .then(() => {
                setVerifyEmail(true);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setIsLoading(false);
        });
    };

    const sendVerificationEmail = (user, actionCodeSettings) => {
        sendEmailVerification(user, actionCodeSettings)
            .then(() => {
                setShowResentModal(true);
                setTimeout(() => {
                    setShowResentModal(false);
                }, 5000);
            })
            .catch((error) => {
                if (error.code === 'auth/too-many-requests') {
                    setError('Too many verification email requests. Please try again later.');
                } else {
                    setError(error.message);
                }
            });
    };

    const handleResendVerificationEmail = () => {
        const actionCodeSettings = {
            url: `http://localhost:3000/verify-email?email=${encodeURIComponent(auth.currentUser.email)}`,
            handleCodeInApp: true
          };
        setError(null);
        sendVerificationEmail(user, actionCodeSettings);
    };


  return (
    <div>
      <div
        id='closeSuccess'
        // onClick={handleClick}
        className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20"
      >
        {!verifyEmail ? ( 
            <div className="bg-white p-12 h-2/3 w-2/5 rounded-lg shadow-xl">
                <div className="mb-3 text-center">
                    <p className="font-weight-bold text-3xl mb-0">Verify your Email</p>
                </div>
                <div className="flex items-center justify-center mb-4 text-red-500">
                    <RiMailCloseLine className="w-40 h-40 rounded-full border-4 border-red-500 p-3" />
                </div>
                <div className="mb-2 text-center py-2">
                    Please click the button below to verify your email address <strong>{email}</strong>.
                </div>
                <div className="flex flex-col">
                    <div 
                        onClick={handleSendVerificationEmail}
                        className="text-center mt-2 mb-2 bg-teal-800 hover:bg-teal-500 font-bold py-2 px-4 rounded mr-2">
                    <Link className="text-white inline-flex items-center" disabled={isLoading} >
                         {isLoading ? <CgSpinner className="animate-spin mr-2 size-6" /> : 'VERIFY EMAIL'}
                    </Link>
                    </div>
                </div>
                <hr class="mb-4 mt-4"></hr>
                <div class="text-center">
                    Wrong email address? <Link className="text-teal-500 hover:text-teal-300 transition-colors duration-300">Change Email Address</Link>
                </div>
            </div>
        ): (
            <div className="bg-white p-12 h-4/5 w-2/5 rounded-lg shadow-xl">
                <div className="mb-3 text-center">
                    <p className="font-weight-bold text-3xl mb-0">Check your Email Inbox now</p>
                </div>
                <div className="flex items-center justify-center mb-4 text-green-500">
                    <MdMarkEmailRead className="w-40 h-40 rounded-full border-4 border-green-500 p-3" />
                </div>
                <div className="mb-2 text-center py-2">
                    We've sent you a verification to your email address <strong>{email}</strong> to activate your account.
                </div>
                <div className="flex flex-col">
                    <div className="text-center mb-2 mt-2 bg-teal-800 hover:bg-teal-500 font-bold py-2 px-4 rounded mr-2">
                    <Link className="text-white inline-flex items-center" onClick={showMenu} >
                        CONTINUE FOR FREE <FaArrowRight className="ml-1"/>
                    </Link>
                    </div>
                </div>
                <div class="text-center">
                    Didn't receive an email?  <button className="text-teal-500 hover:text-teal-300 transition-colors duration-300" onClick={handleResendVerificationEmail} >Re-send verification email</button>
                    {showResentModal && <div className="bg-green-500 text-white p-2 rounded mt-2 absolute top-20 right-4">Verification email re-sent to {email}
                </div>}
                </div>
                {error && <div className="text-red-500 text-center mb-2">{error}</div>}
                <hr class="mb-4 mt-4"></hr>
                <div class="text-center">
                    Wrong email address? <Link className="text-teal-500 hover:text-teal-300 transition-colors duration-300">Change Email Address</Link>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

export default EmailVerification
