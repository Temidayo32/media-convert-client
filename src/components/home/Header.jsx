import React, {useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Login, PasswordReset, Signup, AccountSuccess, EmailVerification, EmailAdminVerication, EmailVerificationMenu, Menu, HeaderOptions } from '..';
import { getSessionStorageItem, setSessionStorageItem, removeSessionStorageItem } from '../../utils/localStorage';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { useData } from '../../DataContext';
import { GoogleAuthProvider } from "firebase/auth";


import { FaBars, FaTimes } from 'react-icons/fa';


function Header() {
    const [showLogin, setShowLogin] = useState(true);
    const [showSignUp, setShowSignUp] = useState(true);
    const [showLoginOptions, setShowLoginOptions] = useState(false);
    const {showSignUpOptions, setShowSignUpOptions, showUser, setShowUser }  = useData();
    const {idToken, setIdToken} = useData();
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const { userCredentials, setUserCredentials } = useData();
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const {emailVerified, setEmailVerified} = useData(); 
    const [menuOpen, setMenuOpen] = useState(false);
    const [emailVerificationModal, setEmailVerificationModal] = useState(false);

    const auth = getAuth();
    // console.log(auth.currentUser)


    useEffect(() => {
      const storedUser = getSessionStorageItem('userCredentials');
      const storedToken = getSessionStorageItem('idToken');

      if (storedUser && !storedUser.isAnonymous) {
        setUserCredentials(storedUser);
        setShowUser(true);
        setEmailVerified(storedUser.emailVerified);
        setShowLogin(false);
      }
  
      if (storedToken) {
        setIdToken(storedToken);
      }
  
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && !user.isAnonymous) {
          setUserCredentials(user);
          setShowUser(true);
          setEmailVerified(user.emailVerified);
          setShowLogin(false);
          setSessionStorageItem('userCredentials', user);
          
          user.getIdToken(true).then((token) => {
            setIdToken(token);
            setSessionStorageItem('idToken', token);
          });
        } else {
          setUserCredentials(null);
          setShowUser(false);
          setShowMenu(false);

          // Sign in anonymously if no user is found
          signInAnonymously(auth)
          .then((userCredentials) => {
            const user = userCredentials.user;
            setUserCredentials(user);
            setShowUser(false);
            setEmailVerified(user.emailVerified);
            setShowLogin(false);
            setSessionStorageItem('userCredentials', user);

            user.getIdToken(true).then((token) => {
              setIdToken(token);
              setLocalStorageItem('idToken', token);
            });
          })
          .catch((error) => {
            console.error('Anonymous sign-in failed:', error);
          });
        }
      });
  
      return () => unsubscribe();
    }, [auth, setIdToken]);
    

    // useEffect(() => {
    //   if (idToken !== null) {
    //     console.log('Updated IdToken:', idToken);
    //   }
    // }, [idToken]); 
  
    const toggleLogInOptions = () => {
        setShowLogin(true);
        setShowLoginOptions(!showLoginOptions);
        setShowSignUpOptions(false);
        setShowPasswordReset(false);
    };

    const toggleSignUpOptions = () => {
        setShowSignUpOptions(!showSignUpOptions);
        setShowLoginOptions(false);
        setShowPasswordReset(false);
    };

    const togglePasswordReset = () => {
        setShowLogin(false);
        setShowPasswordReset(!showPasswordReset);
        setShowLoginOptions(false);
        setShowSignUpOptions(false);
    };

    const closeSignUpAndShowSuccess = () => {
        setShowSignUp(false);
      };    
    
    const handleOpenEmailVerification = () => {
    setShowEmailVerification(true);
    setEmailVerificationModal(true);
    };

    const handleVerificationCompletion = () => {
        setShowMenu(true); 
        setShowEmailVerification(false);
      };

    const handleMenuItemClick = () => setMenuOpen(false);
    // console.log(userCredentials)
    

    return (
        <>
        <EmailAdminVerication/>
        {!emailVerified && userCredentials && !userCredentials.isAnonymous && (
            <EmailVerificationMenu
              emailVerified={emailVerified}
              userCredentials={userCredentials}
            />
          )}
        <header className="bg-white py-2 border-b border-gray-200 shadow-xl w-full z-50 top-0 fixed">
          <div className="mx-4 sm:mx-6 flex justify-between items-center">
            <div className="flex items-center gap-12">
              <div className='flex items-center'>
                <img src="/img/icons/medialogo.svg" alt="Logo" className="w-8 sm:w-12 md:w-14 mr-4 text-teal-800"/>
                <Link to="/" className="text-teal-800 text-base sm:text-lg md:text-xl font-bold">Convert Quickly</Link>
              </div>
              <div className="hidden md:flex">
                <HeaderOptions />
              </div>
            </div>
            {showUser ? (
                <div className="md:hidden mr-4 flex sm:mr-6">
                  <Menu showMenu={showMenu} setShowMenu={setShowMenu} />
                </div>
              ) :  (
              <div className="flex md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-teal-800 mr-8">
                {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
            )}
            <div className="hidden md:flex mr-4 sm:mr-6">
              {showUser ? (
                  <Menu showMenu={showMenu} setShowMenu={setShowMenu} />
              ) : (
                <>
                  <button onClick={() => { toggleLogInOptions(); handleMenuItemClick(); }} className="text-teal-800 hover:text-teal-500 transition-colors duration-300 py-2 px-4 mr-2">Log In</button>
                  <button onClick={() => { toggleSignUpOptions(); handleMenuItemClick(); }} className="bg-teal-800 hover:bg-teal-500 transition-colors duration-300 text-white py-2 px-4 rounded-full">Sign Up</button>
                </>
              )}
            </div>
          </div>
          {menuOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMenuOpen(false)}>
              <div className="fixed top-0 right-0 w-full md:w-1/2 bg-white h-full shadow-lg transition-transform transform duration-300 ease-in-out" style={{ transform: menuOpen ? 'translateX(0)' : 'translateX(100%)' }} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end items-center p-4 border-b border-gray-200">
                  <button onClick={() => setMenuOpen(false)} className="text-teal-800 mr-8">
                    <FaTimes size={24} />
                  </button>
                </div>
                <div className="flex flex-col items-center py-4">
                  {!showUser && (
                    <>
                      <button onClick={() => { toggleLogInOptions(); handleMenuItemClick(); }} className="text-teal-800 text-lg hover:text-teal-500 transition-colors duration-300 py-2 px-4 mt-4">Log In</button>
                      <button onClick={() => { toggleSignUpOptions(); handleMenuItemClick(); }} className="bg-teal-800 text-lg hover:bg-teal-500 transition-colors duration-300 text-white py-2 px-4 rounded-full mt-2">Sign Up</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          {showLogin && (
            <Login showSignUp={toggleSignUpOptions} onForgotPasswordClick={togglePasswordReset} show={showLoginOptions} onClose={() => setShowLoginOptions(false)}/>
          )}
          {showPasswordReset && (
            <PasswordReset handleLogIn={toggleLogInOptions} show={showPasswordReset} onClose={togglePasswordReset} />
          )}
          {showSignUp && (
            <Signup 
              showLogin={toggleLogInOptions} show={showSignUpOptions} onClose={() => setShowSignUpOptions(false)} 
              setUserCredentials={setUserCredentials} 
              closeSignUpAndShowSuccess={closeSignUpAndShowSuccess} 
            />
          )}
          {!emailVerificationModal && userCredentials && !showSignUp && <AccountSuccess openEmailVerification={handleOpenEmailVerification} />}
          {showEmailVerification && <EmailVerification showMenu={handleVerificationCompletion} />}
    </header>
        </>
    );
}

export default Header;

// onItemClicked={handleMenuItemClick}