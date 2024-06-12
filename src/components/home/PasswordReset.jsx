import react, {useState, useRef, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMail } from 'react-icons/hi';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';


function PasswordReset({ handleLogIn, show, onClose }) {
    const [email, setEmail] = useState('');
    const passwordRef = useRef(null);
    

    const resetPassword = () => {
        firebase.auth().sendPasswordResetEmail(email).then((userCredentials) => {
          // console.log(userCredentials.user);
        }).catch((error) => {
          console.error(error);
        //   setErrorMessage('Incorrect username or password');
        });
      };
    
    const handleClick = (e) => {
      if (e.target.id === 'closeReset') {
        onClose();
      }
    };

    return (
        <div>
          {show && (
            <div id='closeReset' data-testid='closeReset' onClick={handleClick} className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20">
              <div ref={passwordRef} className="bg-white p-12 h-3/5 w-2/5 rounded-lg shadow-xl">
              <div className="mb-12 text-center"><p className="font-weight-bold text-3xl mb-0">Reset Password</p></div>
              <div>
                  <div className="mb-4 text-center py-2"><strong>Reset the password you use to log into your account.</strong></div>
              </div>
              <div className="flex flex-col mt-8">
                  <div className="flex items-center mb-8">
                      <HiOutlineMail className="w-8 h-8 mr-2 text-gray-500" />
                      <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border border-gray-300 px-4 py-2 rounded w-full focus:outline-none focus:border-blue-500"
                      />
                  </div>
                  <button onClick={resetPassword} className="bg-teal-800 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400">RESET PASSWORD</button>
                  <div className="text-center mb-2 mt-4">
                          Already have an account?  <Link onClick={handleLogIn} className="text-teal-500 hover:text-teal-300 transition-colors duration-300">Log In</Link>
                  </div>
              </div>
              </div>
          </div>
          )}
        </div>
    )
}

export default PasswordReset;