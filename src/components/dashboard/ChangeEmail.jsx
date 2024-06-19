import React, { useState } from 'react';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updateEmail } from 'firebase/auth';
import { CgSpinner } from "react-icons/cg";

const ChangeEmail = () => {
  const auth = getAuth();
  
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(currentEmail, password);

    try {
      // Reauthenticate the user
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, newEmail);
      setMessage('Email updated successfully!');
    } catch (error) {
      setError(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='h-screen p-12 bg-gray-100'>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-center mb-6">Change Email</h2>
        <p className="text-center w-4/5 sm:w-full text-xs md:text-sm lg:text-base mb-6 text-gray-600">You can change the e-mail address for logging in.</p>
         <form 
            onSubmit={handleEmailChange} 
            className="w-full sm:w-3/4 mx-auto sm:p-12"
            >
            <div className="mb-4">
                <label htmlFor="currentEmail" className="block text-xs md:text-sm lg:text-base text-gray-700">Current Email</label>
                <input
                id="currentEmail"
                type="email"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border text-xs md:text-sm lg:text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="newEmail" className="block text-xs md:text-sm lg:text-base text-gray-700">New Email</label>
                <input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border text-xs md:text-sm lg:text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="password" className="block text-xs md:text-sm lg:text-base text-gray-700">Retype Password</label>
                <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border text-xs md:text-sm lg:text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                />
            </div>
            <button
                type="submit"
                className="mt-8 w-full flex items-center justify-center transition-transform bg-teal-800 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-full text-xs md:text-sm lg:text-base transition-colors duration-300 hover:scale-105 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                {isLoading ? <CgSpinner className="animate-spin mr-2 size-6" /> : 'CHANGE EMAIL'}
            </button>
            {error && <div className="mt-4 text-center text-xs md:text-sm lg:text-base text-red-600">{error}</div>}
            {message && <div className="mt-4 text-center text-xs md:text-sm lg:text-base  text-green-600">{message}</div>}
        </form>
    </div>
  );
};

export default ChangeEmail;
