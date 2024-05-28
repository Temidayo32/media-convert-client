import React from 'react';
import { Link, Route, Routes, Navigate } from 'react-router-dom';
import Profile from './Profile'; 

import { ImProfile } from "react-icons/im";
import { MdAddTask, MdOutlineMail, MdOutlinePassword } from "react-icons/md";
import { RiLogoutCircleRLine } from "react-icons/ri";

const Dashboard = () => {

  return (
    <div className="flex h-screen">
      <aside className="w-1/5 h-screen bg-white shadow-lg text-gray-700 relative">
        <nav className="flex flex-col p-4 space-y-8">
          <h2 className="text-xl font-bold">User Dashboard</h2>
          <Link to="profile" className="flex items-center hover:bg-gray-100 p-2 rounded">
          <ImProfile className='mr-4 text-2xl'/> Profile
          </Link>
          <Link to="recent-tasks" className="flex items-center hover:bg-gray-100 p-2 rounded">
            <MdAddTask className='mr-4 text-2xl' /> Recent Tasks
          </Link>
          <Link to="change-email" className="flex items-center hover:bg-gray-100 p-2 rounded">
          <MdOutlineMail className='mr-4 text-2xl' /> Change Email
          </Link>
          <Link to="change-password" className="flex items-center hover:bg-gray-100 p-2 rounded">
          <MdOutlinePassword className='mr-4 text-2xl' /> Change Password
          </Link>
          <Link to="delete-account" className="flex items-center text-red-500 hover:bg-gray-100 p-2 rounded">
           <RiLogoutCircleRLine className='mr-4 text-2xl'/> Delete Account
          </Link>
        </nav>
      </aside>
      <main className="ml-1/4 w-4/5">
        <Routes>
          <Route path="profile" element={<Profile/>} />
          {/* Add routes for other components as needed */}
          <Route path="/" element={<Navigate to="profile" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
