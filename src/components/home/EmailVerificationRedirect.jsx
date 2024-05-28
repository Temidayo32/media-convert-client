import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Confetti from '../Confetti';

import { FaCheck } from 'react-icons/fa';

function EmailVerificationRedirect() {
  const location = useLocation();
  const [email, setEmail] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
      {showConfetti && <Confetti />}
        {email ? (
          <p className="text-teal-500 text-lg p-8">
            Email verified successfully for {email}.
          </p>
        ) : (
          <p className="text-red-500 text-lg">
            Error verifying email. Please try again.
          </p>
        )}
        <div className="flex items-center justify-center mb-4 pb-4 text-green-500">
            <FaCheck className="w-40 h-40 rounded-full border-4 border-green-500 p-3" />
          </div>
        <Link to="/" className="mt-4 transition duration-300 hover:bg-teal-500 hover:text-white text-teal-500 border rounded p-4">
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default EmailVerificationRedirect;
