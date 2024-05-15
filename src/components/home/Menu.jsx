import React from 'react';
import { RxHamburgerMenu } from "react-icons/rx";
import { signOut, getAuth } from 'firebase/auth';

function Menu({ showMenu, setShowMenu }) {

  const auth = getAuth();
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Log out successful, you can redirect the user or perform any additional actions here
        console.log("User logged out successfully");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className="relative inline-block text-left">
      <button
          type="button"
          className="inline-flex justify-center w-full rounded-full border border-gray-300 shadow-sm px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
          id="options-menu"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setShowMenu(prev => !prev)}
        >
          <RxHamburgerMenu className="h-6 w-6" />
        </button>      
      <div
        className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${showMenu ? 'block' : 'hidden'}`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        <div className="py-1" role="none">
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            Profile
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            Help & Support
          </a>
          <button
            onClick={handleLogout}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            role="menuitem"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;
