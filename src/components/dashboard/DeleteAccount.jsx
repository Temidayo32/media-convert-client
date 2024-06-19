import React, { useState } from 'react';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { CgSpinner } from "react-icons/cg";

const DeleteAccount = () => {
  const auth = getAuth();
  
  const [currentEmail, setCurrentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(currentEmail, password);

    try {
      // Reauthenticate the user
      await reauthenticateWithCredential(user, credential);

      // Delete user
      await deleteUser(user);
      setMessage('User account deleted successfully!');
    } catch (error) {
      setError(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='h-screen p-12 bg-gray-100'>
        <h2 className="text-xl md:text-2xl lg:text-3xl text-center font-semibold mb-4">Delete Account</h2>
        <p className="text-center text-xs md:text-sm lg:text-base mb-6 text-gray-600">On this page, you can close your account.</p>
         <form 
            onSubmit={handleDeleteAccount} 
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
                <label htmlFor="password" className="block text-xs md:text-sm lg:text-basetext-gray-700">Password</label>
                <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs md:text-sm lg:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                />
            </div>

            <button
                type="submit"
                className="mt-8 w-full flex items-center text-xs md:text-sm lg:text-base justify-center transition-transform rounded-full bg-red-800 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors hover:scale-105 duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400"
            >
                {isLoading ? <CgSpinner className="animate-spin mr-2 size-6" /> : 'DELETE ACCOUNT'}
            </button>
            {error && <div className="mt-4 text-center text-xs md:text-sm lg:text-base text-red-600">{error}</div>}
            {message && <div className="mt-4 text-center text-xs md:text-sm lg:text-base text-green-600">{message}</div>}
            <div className="mt-8 p-4 border text-xs md:text-sm lg:text-base border-red-500 text-center text-red-600 rounded">
              <strong>Warning: </strong> Deleting your account is irreversible. All your data will be permanently removed.
            </div>
        </form>
    </div>
  );
};

export default DeleteAccount;
