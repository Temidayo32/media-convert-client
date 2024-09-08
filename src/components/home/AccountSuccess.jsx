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
        className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20"
      >
        <div className="bg-white p-12 h-3/5 sm-custom:w-3/5 md:w-2/5 w-4/5 rounded-lg shadow-xl">
          <div className="mb-3 text-center">
            <p className="font-weight-bold text-lg md:text-2xl mb-0">Account Created!</p>
          </div>
          <div className="mb-4 text-center text-sm md:text-base py-2">
            Thank you for signing up to Convert Quickly, you are the best!
          </div>
          <div className="flex items-center justify-center mb-4 text-green-500">
            <FaCheck className="w-12 h-12 sm:w-16 sm:h-16 lg:w-28 lg:h-28 xl:w-40 xl:h-40 rounded-full border-4 border-green-500 p-3" />
          </div>
          <div className="flex flex-col mt-4 sm-custom:mt-8">
            <div className="text-center mb-2 mt-4 bg-teal-800 hover:bg-teal-500 font-bold py-2 px-4 rounded mr-2">
              <Link 
                onClick={openEmailVerification}
                className="text-white text-xs md:text-sm lg:text-base inline-flex items-center">
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
