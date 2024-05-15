import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaArrowRight } from 'react-icons/fa';

import Confetti from '../Confetti';

function AccountSuccess({ openEmailVerification }) {
  const [showConfetti, setShowConfetti] = useState(true);

  const handleClick = (e) => {
    if (e.target.id === 'closeSuccess') {
      // onClose();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);


  return (
    <div>
      {showConfetti && <Confetti />}
      <div
        id='closeSuccess'
        onClick={handleClick}
        className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10"
      >
        <div className="bg-white p-12 h-3/5 w-2/5 rounded-lg shadow-xl">
          <div className="mb-3 text-center">
            <p className="font-weight-bold text-3xl mb-0">Account Created!</p>
          </div>
          <div className="mb-4 text-center py-2">
            Thank you for signing up to Media Convert, you are the best!
          </div>
          <div className="flex items-center justify-center mb-4 text-green-500">
            <FaCheck className="w-40 h-40 rounded-full border-4 border-green-500 p-3" />
          </div>
          <div className="flex flex-col mt-8">
            <div className="text-center mb-2 mt-4 bg-teal-800 hover:bg-teal-500 font-bold py-2 px-4 rounded mr-2">
              <Link 
                onClick={openEmailVerification}
                className="text-white inline-flex items-center">
                CONTINUE FOR FREE <FaArrowRight className="ml-1"/>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSuccess;
