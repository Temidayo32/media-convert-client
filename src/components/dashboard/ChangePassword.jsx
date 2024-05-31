import React, { useState } from 'react';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { useData } from '../../DataContext';
import { CgSpinner } from "react-icons/cg";

const ChangePassword = () => {
  const auth = getAuth();
  const { emailVerified } = useData();

  console.log(emailVerified)
  
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(currentEmail, currentPassword);

    try {
      // Reauthenticate the user
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      setMessage('Password updated successfully!');
    } catch (error) {
      setError(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='h-screen p-12 bg-gray-100'>
        <h2 className="text-3xl text-center font-semibold mb-6">Change Password</h2>
        <p className="text-center mb-6 text-gray-600">Change the password for logging into your account.</p>
         {!emailVerified ? (
            <div className='text-center text-lg text-red-500'>
                Please verify your email to access this feature.
            </div>
         ):(
            <form 
            onSubmit={handlePasswordChange} 
            className="w-3/4 mx-auto p-12"
            >
            <div className="mb-4">
                <label htmlFor="currentEmail" className="block text-gray-700">Current Email</label>
                <input
                id="currentEmail"
                type="email"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-gray-700">Current Password</label>
                <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="newPassword" className="block text-gray-700">New Password</label>
                <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                />
            </div>
            <button
                type="submit"
                className="mt-8 w-full flex items-center justify-center transition-transform bg-teal-800 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 hover:scale-105 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                {isLoading ? <CgSpinner className="animate-spin mr-2 size-6" /> : 'CHANGE PASSWORD'}
            </button>
            {error && <div className="mt-4 text-center text-red-600">{error}</div>}
            {message && <div className="mt-4 text-center text-green-600">{message}</div>}
        </form>
         )}
    </div>
  );
};

export default ChangePassword;
