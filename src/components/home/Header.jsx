import React, {useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Login, PasswordReset, Signup, AccountSuccess, EmailVerification, EmailVerificationMenu, Menu } from '..';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useData } from '../../DataContext';


function Header() {
    const [showLogin, setShowLogin] = useState(true || window.localStorage.getItem('auth') === 'true');
    const [showSignUp, setShowSignUp] = useState(true);
    const [showLoginOptions, setShowLoginOptions] = useState(false);
    const {showSignUpOptions, setShowSignUpOptions} = useData();
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [userCredentials, setUserCredentials] = useState(null);
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showUser, setShowUser ] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false); 

    const auth = getAuth();

    useEffect(() => {
      const subscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserCredentials(user);
          setShowUser(user.uid);
          setEmailVerified(user.emailVerified);
          setShowLogin(false);
          window.localStorage.setItem('auth', 'true');
          user.getIdToken().then((token) => {
            console.log(token)
          })
        } else {
          setUserCredentials(null);
          setShowMenu(false);
        }
      });

      return subscribe;
    }, [auth]);
  
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
    setUserCredentials(null); 
    };

    const handleVerificationCompletion = () => {
        setShowMenu(true); 
        setShowEmailVerification(false);
      };
    

    return (
        <>
        {!emailVerified && userCredentials && (
            <EmailVerificationMenu
              emailVerified={emailVerified}
              userCredentials={userCredentials}
            />
          )}
        <header className="bg-white py-4 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
                <img src="/medialogo.svg" alt="Logo" className="w-14 mr-4 text-teal-800"/>
                <Link to="/" className="text-teal-800 text-xl font-bold">Media Convert</Link>
          </div>
            <div className="flex">
                {showUser ? (
                    <Menu showMenu={showMenu} setShowMenu={setShowMenu} />
                ) : (
                    <>
                    <button onClick={toggleLogInOptions} className="text-teal-800 hover:text-teal-500 transition-colors duration-300 py-2 px-4 mr-2">Log In</button>
                    <button onClick={toggleSignUpOptions} className="bg-teal-800 hover:bg-teal-500 transition-colors duration-300 text-white py-2 px-4 rounded-full">Sign up</button>
                    </>
                )}
                {showLogin ? (
                    <Login showSignUp={toggleSignUpOptions} onForgotPasswordClick={togglePasswordReset} show={showLoginOptions} onClose={() => setShowLoginOptions(false)}/>
                ) : (
                    <PasswordReset handleLogIn={toggleLogInOptions} show={showPasswordReset} onClose={togglePasswordReset} />
                )}
                {showSignUp && (
                    <Signup 
                        showLogin={toggleLogInOptions} show={showSignUpOptions} onClose={() => setShowSignUpOptions(false)} 
                        setUserCredentials={setUserCredentials} 
                        closeSignUpAndShowSuccess={closeSignUpAndShowSuccess} 
                    />
                )}
                {userCredentials && !showSignUp && <AccountSuccess openEmailVerification={handleOpenEmailVerification}  />}
                {showEmailVerification && <EmailVerification showMenu={handleVerificationCompletion} />}
            </div>
        </div>
        </header>
        </>
    );
}

export default Header;