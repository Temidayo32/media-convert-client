import React, {useState} from 'react';
import { Link, Route, Routes, Navigate } from 'react-router-dom';
import Profile from './Profile';
import RecentTasks from './RecentTasks';
import ChangeEmail from './ChangeEmail';
import ChangePassword from './ChangePassword';
import DeleteAccount from './DeleteAccount';

import { ImProfile } from "react-icons/im";
import { MdAddTask, MdOutlineMail, MdOutlinePassword } from "react-icons/md";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { CgPushLeft,  CgPushRight } from "react-icons/cg";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeLink, setActiveLink] = useState('profile');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
        {isSidebarOpen ? (
          <aside className={`relative mt-20 z-40 sm:z-auto top-0 left-0 sm:top-auto sm:left-auto transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:-translate-x-0'} transition-transform duration-300 ${isSidebarOpen ? 'w-1/3 ': 'hidden'} sm:w-1/5 h-screen bg-white shadow-lg text-gray-700`}>
            <nav className="flex flex-col p-2 sm:p-4 space-y-8">
              <CgPushLeft onClick={toggleSidebar} className='text-lg sm:text-xl md:text-2xl'/> 
              <h2 className="text-sm md:text-lg lg:text-xl font-bold">User Dashboard</h2>
              <Link to="profile" className="flex items-center hover:bg-gray-100 p-2 rounded">
                <ImProfile className='mr-4 text-lg sm:text-xl md:text-2xl'/> 
                <p className="text-sm lg:text-base">Profile</p>
              </Link>
              <Link to="recent-tasks" className="flex items-center hover:bg-gray-100 p-2 rounded">
                <MdAddTask className='mr-4 text-lg sm:text-xl md:text-2xl' /> 
                <p className="text-sm lg:text-base">Recent Tasks</p>
              </Link>
              <Link to="change-email" className="flex items-center hover:bg-gray-100 p-2 rounded">
                <MdOutlineMail className='mr-4 text-lg sm:text-xl md:text-2xl' /> 
                <p className="text-sm lg:text-base">Change Email</p>
              </Link>
              <Link to="change-password" className="flex items-center hover:bg-gray-100 p-2 rounded">
                <MdOutlinePassword className='mr-4 text-lg sm:text-xl md:text-2xl' />
                <p className="text-sm lg:text-base">Change Password</p>
              </Link>
              <Link to="delete-account" className="flex items-center text-red-500 hover:bg-gray-100 p-2 rounded">
                <RiLogoutCircleRLine className='mr-4 text-lg sm:text-xl md:text-2xl'/> 
                <p className="text-sm lg:text-base">Delete Account</p>
              </Link>  
          </nav>
        </aside>
        ) : (
          <aside className="w-16 mt-10 sm:w-20 h-screen bg-white shadow-lg text-gray-700">
            <nav className="flex flex-col mt-8 ml-2 p-2 sm:p-4 space-y-8">
              <CgPushRight onClick={toggleSidebar} className='text-lg sm:text-xl md:text-2xl' />
              <Link to="profile" onClick={() => setActiveLink('profile')} className={`relative group ${activeLink === 'profile' ? 'text-green-600' : 'text-gray-700'}`}>
              <ImProfile className='mr-4 mb-1 text-lg sm:text-xl md:text-2xl'/>
            </Link>
            <Link to="recent-tasks" onClick={() => setActiveLink('recent-tasks')} className={`relative group ${activeLink === 'recent-tasks' ? 'text-green-600' : 'text-gray-700'}`}>
              <MdAddTask className='mr-4 text-lg sm:text-xl md:text-2xl' />
            </Link>
            <Link to="change-email" onClick={() => setActiveLink('change-email')} className={`relative group ${activeLink === 'change-email' ? 'text-green-600' : 'text-gray-700'}`}>
              <MdOutlineMail className='mr-4 text-lg sm:text-xl md:text-2xl' />
            </Link>
            <Link to="change-password" onClick={() => setActiveLink('change-password')} className={`relative group ${activeLink === 'change-password' ? 'text-green-600' : 'text-gray-700'}`}>
              <MdOutlinePassword className='mr-4 text-lg sm:text-xl md:text-2xl' />
            </Link>
            <Link to="delete-account" onClick={() => setActiveLink('delete-account')} className={`relative group ${activeLink === 'delete-account' ? 'text-red-500' : 'text-gray-700'}`}>
              <RiLogoutCircleRLine className='mr-4 text-lg sm:text-xl md:text-2xl'/>
            </Link>
          </nav>
        </aside>
        )}
      <main className="ml-1/4 w-full mt-16">
        <Routes>
          <Route path="profile" element={<Profile/>} />
          <Route path="recent-tasks" element={<RecentTasks />} />
          <Route path="change-email" element={<ChangeEmail />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="delete-account" element={<DeleteAccount />} />
          {/* Add routes for other components as needed */}
          <Route path="/" element={<Navigate to="profile" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
