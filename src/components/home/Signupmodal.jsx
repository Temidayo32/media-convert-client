import React from 'react';
import { useData } from '../../DataContext';
import { getSessionStorageItem } from '../../utils/localStorage';



const Signupmodal = () => {
  const { showSignUpOptions, setShowSignUpOptions } = useData();
  const storedUser = getSessionStorageItem('userCredentials');


  const toggleSignUpOptions = () => {
      setShowSignUpOptions(!showSignUpOptions);
  };
  return (
    <div>
        {
        storedUser.isAnonymous && <div className="bg-teal-500 border mx-4 sm:mx-8 md:mx-16 lg:mx-24 xl:mx-48 my-8 p-8 sm:p-12 md:p-16 border-teal-600 rounded-lg shadow-2xl transition-transform duration-300 hover:scale-105 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white mb-4 sm:mb-6 md:mb-8 px-4 sm:px-8 md:px-16 lg:px-24">
          Get unlimited access to convert as many files as you want
        </h2>
        <button
          onClick={toggleSignUpOptions}
          className="bg-teal-800 hover:bg-teal-600 text-lg sm:text-xl md:text-2xl text-white py-2 sm:py-3 md:py-4 px-8 sm:px-12 md:px-16 rounded-lg transition-colors duration-300"
        >
          Signup
        </button>
      </div>
      }
    </div>
  );
};

export default Signupmodal;
