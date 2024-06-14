import React, { useState, useEffect, useRef } from 'react';
import { MdOutlineArrowDropDown } from "react-icons/md";
import { FaVideo, FaImage } from "react-icons/fa";
import { IoMdDocument, IoIosArrowForward } from "react-icons/io";
import { useLocation } from 'react-router-dom';

import NestedOptions from './NestedOptions';

const HeaderOptions = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [conversions, setConversions] = useState([]);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    fetch('/conversions.json')
      .then(response => response.json())
      .then(data => setConversions(data))
      .catch(error => console.error('Error fetching conversions:', error));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleMouseEnterVideo = () => {
    setIsVideoHovered(true);
  };

  const handleMouseLeaveVideo = () => {
    setIsVideoHovered(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div
        onClick={toggleDropdown}
        className="relative flex items-center cursor-pointer"
      >
        <div className="hover:text-teal-500 hover:scale-105 flex items-center">
            <span className="text-lg font-semibold">All Tools</span>
            <MdOutlineArrowDropDown className="size-8 ml-1" />
        </div>
        {isDropdownOpen && (
          <div className="absolute top-10 text-base w-60 h-80 bg-white shadow-lg rounded-l-lg z-10">
            <ul className="py-1">
              <li 
                className="block p-6 flex items-center gap-4 justify-between text-gray-700 hover:bg-gray-100"
                onMouseEnter={handleMouseEnterVideo}
                onMouseLeave={handleMouseLeaveVideo}
              >
                <FaVideo className='size-6 text-teal-500'/> 
                Video Conversion
                <IoIosArrowForward className='size-6 text-gray-800'/>
              </li>
              <li className="block p-6 text-gray-400 gap-4 cursor-not-allowed gap-2 flex items-center hover:bg-gray-100">
                <FaImage className='size-8'/> 
                Image Conversion
                <IoIosArrowForward className='size-6'/>
              </li>
              <li className="block p-6 text-gray-400 gap-4 cursor-not-allowed gap-2 flex items-center hover:bg-gray-100">
                <IoMdDocument className='size-8'/> 
                Document Conversion
                <IoIosArrowForward className='size-6'/>
              </li>
            </ul>
          </div>
        )}
      </div>
      {(isVideoHovered) && (
        <div
          className="absolute top-10 p-4 mt-0 text-lg h-80 bg-white shadow-lg rounded-r-lg z-20"
          style={{ left: "calc(100% + 136px)", width: "40rem" }}
          onMouseEnter={handleMouseEnterVideo}
          onMouseLeave={handleMouseLeaveVideo}
        >
          <NestedOptions conversions={conversions} />
        </div>
      )}
    </div>
  );
};


export default HeaderOptions;
