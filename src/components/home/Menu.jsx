import { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { RxHamburgerMenu } from 'react-icons/rx'; 

function Menu() {
  const [showMenu, setShowMenu] = useState(false);
  const [menuTimer, setMenuTimer] = useState(null); 
  const auth = getAuth();

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
    <div className="relative inline-block text-left z-20">
      <button
        type="button"
        className="inline-flex justify-center w-full rounded-full border border-gray-300 shadow-sm px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-100"
        id="options-menu"
        aria-expanded="true"
        aria-haspopup="true"
        onMouseEnter={handleMouseEnter} // Show menu on hover
        onMouseLeave={handleMouseLeave} // Hide menu on mouse leave
      >
        <RxHamburgerMenu className="h-6 w-6" />
      </button>
      <div
        className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition-opacity duration-200 ${showMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave} 
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
