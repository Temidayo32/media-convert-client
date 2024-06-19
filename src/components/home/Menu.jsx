import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { RxHamburgerMenu, RxDashboard } from 'react-icons/rx'; 
import { RiLogoutCircleRLine } from "react-icons/ri";
import { MdAddTask } from "react-icons/md";
import { useData } from '../../DataContext';

function Menu() {
  const [showMenu, setShowMenu] = useState(false);
  const [menuTimer, setMenuTimer] = useState(null); 
  const auth = getAuth();
  const { userCredentials } = useData();

  const email = userCredentials.email;

  let displayName = userCredentials.displayName || '';
    if (!displayName) {
    const username = email.split('@')[0];
    displayName = username.charAt(0).toUpperCase() + username.slice(1);
    }
    
  const photoURL = userCredentials.photoURL || `https://api.dicebear.com/8.x/micah/svg?backgroundColor=ffd4b2,ffc9a3,ffb84c&backgroundType=gradientLinear,solid`;

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out successfully");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const handleMouseEnter = () => {
    setShowMenu(true); 
    if (menuTimer) clearTimeout(menuTimer); 
  };

  const handleMouseLeave = () => {
    setMenuTimer(setTimeout(() => setShowMenu(false), 200));
  };

  return (
    <div className="relative inline-block text-left z-50">
      <button
        type="button"
        className="inline-flex justify-center w-full rounded-full border border-gray-300 shadow-sm px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-100"
        id="options-menu"
        data-testid='options-menu'
        aria-expanded="true"
        aria-haspopup="true"
        onMouseEnter={handleMouseEnter} // Show menu on hover
        onMouseLeave={handleMouseLeave} // Hide menu on mouse leave
      >
        <RxHamburgerMenu className="h-4 w-4 md:h-6 md:w-6" />
      </button>
      <div
        className={`origin-top-right absolute right-0 mt-2 w-52 sm:w-60 md:w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition-opacity duration-200 ${showMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave} 
      >
        <div className="py-1" role="none">
          <div className="flex items-center p-4">
          <img src={photoURL} alt="Menu" className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full mr-4" />
          <div>
            <h2 className="text-xs md:text-sm lg:text-base font-bold">{displayName}</h2>
            <p className="text-gray-600 text-xs md:text-sm lg:text-base">Free Plan</p>
          </div>
        </div>
        <hr className=""></hr>
          <Link
            to='/dashboard/recent-tasks'
            className="block p-2 md:p-4 flex items-center w-full text-base text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            <MdAddTask className='mr-4 text-2xl' /> 
            <p className="text-xs md:text-sm lg:text-base">Recent Tasks</p>
          </Link>
          <p className="block p-2 md:p-4 text-sm">Account</p>
          <Link
            to="/dashboard"
            className="block p-2 md:p-4 flex items-center w-full text-base text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            <RxDashboard className='mr-4 text-2xl' /> 
            <p className="text-xs md:text-sm lg:text-base">Go To Dashboard</p>
          </Link>
          {/* <button
            onClick={() => {}}
            className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            Help & Support
          </button> */}
          <button
            onClick={handleLogout}
            className="block p-2 md:p-4 flex items-center text-base text-red-500 hover:bg-gray-100 w-full text-left"
            role="menuitem"
          >
            <RiLogoutCircleRLine className='mr-4 text-2xl'/> 
            <p className="text-xs md:text-sm lg:text-base">Logout</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;
