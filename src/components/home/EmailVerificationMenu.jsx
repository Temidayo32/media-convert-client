import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { getAuth, sendEmailVerification } from 'firebase/auth';

import { FaEdit } from "react-icons/fa";
import { RiMailSendLine } from "react-icons/ri";

function EmailVerificationMenu({ emailVerified, userCredentials }) {
  const [showResendModal, setShowResendModal] = useState(false);

  const auth = getAuth();
  const handleResendEmail = () => {
    const actionCodeSettings = {
      url: `http://localhost:3000/verify-email?email=${encodeURIComponent(auth.currentUser.email)}`,
      handleCodeInApp: true
    };
    sendEmailVerification(auth.currentUser, actionCodeSettings)
      .then(() => {
        setShowResendModal(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (showResendModal) {
      const timeoutId = setTimeout(() => {
        setShowResendModal(false);
      }, 2000); 

      return () => clearTimeout(timeoutId);
    }
  }, [showResendModal]);


  return (
    <div className="bg-orange-700 py-2 px-4 flex flex-col justify-center">
        <p className="text-white">
          Please verify your email address. Your account is limited without verifying your email address.
        </p>
        {!emailVerified && (
          <div className="space-x-2">
            <div className="inline-flex flex-col">
            <div className="text-center mb-2 mt-4 bg-teal-500 hover:bg-teal-800 transition duration-300 font-bold py-2 px-4 rounded mr-2">
              <Link 
                onClick={handleResendEmail}
                className="text-white inline-flex items-center">
                  <RiMailSendLine className="mr-2" />  Re-send Verification Email
              </Link>
            </div>
          </div>
            <div className="inline-flex flex-col">
            <div className="text-center mb-2 mt-4 bg-white transition duration-300 hover:bg-teal-500 font-bold py-2 px-4 rounded mr-2">
              <Link 
                className="text-orange-500 hover:text-white inline-flex items-center">
                  <FaEdit className="mr-2" />  Change Email Address
              </Link>
            </div>
          </div>
          </div>
        )}
      {showResendModal && (
        <div className="mt-4 mb-4">
          <div className="bg-green-500 w-1/2 text-white p-2 rounded">Verification email re-sent to {userCredentials.email}</div>
        </div>
      )}
    </div>
  );
}

export default EmailVerificationMenu;
