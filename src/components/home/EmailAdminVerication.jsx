import React, {useState, useEffect, useRef} from 'react';
import { HiOutlineMail } from 'react-icons/hi';
import { CgSpinner } from "react-icons/cg";
import { useData } from '../../DataContext';
import {emailVerification} from '../../utils/email';
import { validateEmail } from '../../utils/auth';

function EmailAdminVerication() {
    const {open, setOpen} = useData();
    const verifyRef = useRef(null);
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Set a timeout to clear the messages after 5 seconds
        const timeoutId = setTimeout(() => {
          setErrorMessage('');
          setSuccessMessage('');
        }, 5000);
    
        // Cleanup the timeout if the component is unmounted before 5 seconds
        return () => clearTimeout(timeoutId);
      }, [errorMessage, successMessage]);
    

    async function sendVerificationEmail() {
        setIsLoading(true);
        
        try {
            if (!email || !validateEmail(email)) {
                setIsLoading(false);
                setErrorMessage('Please enter a valid email address.');
                return;
            } else {
                await emailVerification(email, setErrorMessage, setSuccessMessage);
            }
        } catch (error) {
            console.error('Error sending verification email:', error);
            setErrorMessage('Failed to send verification email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }    

    const handleClick = (e) => {
        if (e.target.id === 'closeVerify') {
          setOpen(false);
        }
      };


  return (
   <>
     {open && (
            <div id='closeVerify' className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20" onClick={handleClick}>
                <div ref={verifyRef} className="bg-white p-8 sm:p-12 h-fit w-10/12 md:w-2/3 lg:w-1/2 xl:w-2/5 rounded-lg shadow-xl">
                    <div className="mb-6 text-center">
                        <p className="font-weight-bold text-lg md:text-2xl mb-0">Verify your Email</p>
                    </div>
                    <div className="mb-4 text-sm md:text-base text-center py-2">
                        <strong>Please verify your email address to login</strong>
                    </div>
                    <div className="flex items-center">
                        <HiOutlineMail className="w-8 h-8 mr-2 text-gray-500 sm:w-2 sm:h-2 md:w-8 md:h-8 lg:w-10 lg:h-10" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`border ${errorMessage ? 'border-red-500' : 'border-gray-300'} px-2 py-1 md:px-4 md:py-2 rounded w-full focus:outline-none focus:border-blue-500 text-xs md:text-base lg:text-lg`}
                        />
                    </div>
                    {errorMessage && (
                        <p className="text-red-500 mb-4 text-xs md:text-sm text-center">{errorMessage}</p>
                    )}
                    {successMessage && (
                        <p className="text-teal-500 mb-4 text-xs md:text-sm text-center">{successMessage}</p>
                    )}
                    <div className="flex justify-center mt-8">
                        <button onClick={sendVerificationEmail} disabled={isLoading} className="text-center text-xs md:text-base bg-teal-800 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400">
                            {isLoading ? <CgSpinner className="animate-spin mr-2 size-4 md:size-6" /> : 'VERIFY EMAIL'}
                        </button>
                    </div>
                </div>
            </div>
        )}
   </>
  )
}   

export default EmailAdminVerication;
