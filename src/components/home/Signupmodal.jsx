import React from 'react';
import { useData } from '../../DataContext';

const Signupmodal = () => {
  const { showSignUpOptions, setShowSignUpOptions } = useData();
    
  const toggleSignUpOptions = () => {
      setShowSignUpOptions(!showSignUpOptions);
  };
  
  return (
    <div className="bg-teal-500 border m-24 mx-48 p-16 border-teal-600 p-8 rounded-lg shadow-2xl transition-transform duration-300 hover:scale-105 text-center">
      <h2 className="text-4xl text-white mb-8 px-24">Get unlimited access to convert as many files as you want</h2>
      <button onClick={toggleSignUpOptions} className="bg-teal-800 hover:bg-teal-600 text-2xl text-white py-4 px-16 rounded-lg transition-colors duration-300">Signup</button>
    </div>
  );
};

export default Signupmodal;
