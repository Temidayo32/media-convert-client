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
    <div className="bg-orange-700 py-2 px-2 flex flex-col items-center md:flex-row lg:justify-between lg:items-center w-full absolute top-0">
      <p className="text-white text-xs lg:text-sm text-center lg:text-left">
        Please verify your email address. Your account is limited without verifying your email address.
      </p>
      {!emailVerified && (
        <div className="mt-1 lg:mt-0 flex flex-col md:flex-row md:space-x-2">
          <div className="text-center text-xs lg:text-sm mb-1 mt-1 lg:mt-0 bg-teal-500 hover:bg-teal-800 transition duration-300 font-bold py-2 px-4 rounded">
            <Link onClick={handleResendEmail} className="text-white inline-flex items-center">
              <RiMailSendLine className="mr-2" /> Re-send Verification Email
            </Link>
          </div>
          <div className="text-center text-xs lg:text-sm mb-1 mt-1 lg:mt-0 bg-white transition duration-300 hover:bg-teal-500 font-bold py-2 px-4 rounded">
            <Link className="text-orange-500 hover:text-white inline-flex items-center">
              <FaEdit className="mr-2" /> Change Email Address
            </Link>
          </div>
        </div>
      )}
      {showResendModal && (
        <div className="mt-1 mb-1 lg:mt-0 lg:mb-0 w-full lg:w-1/2">
          <div className="bg-green-500 text-xs lg:text-sm text-white p-2 rounded text-center">
            Verification email re-sent to {userCredentials.email}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailVerificationMenu;
