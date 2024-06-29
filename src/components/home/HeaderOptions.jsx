import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FaVideo, FaImage } from "react-icons/fa";
import { IoMdDocument, IoIosArrowForward } from "react-icons/io";
import { useLocation, Link } from 'react-router-dom';

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
      .then(data => setConversions(data.videos))
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
          {isDropdownOpen ? <FaChevronUp className="ml-4" /> : <FaChevronDown className="ml-4" />}
        </div>
        {isDropdownOpen && (
          <div className="absolute top-10 text-base w-72 xl:w-60 xl:h-80 bg-white shadow-lg rounded-lg xl:rounded-l-lg z-10">
            <ul className="py-1">
              <li 
                className="block p-6 flex items-center gap-4 justify-between text-gray-700 hover:bg-gray-100 xl:hidden"
              >
                <Link to="/video-converter" className="flex items-center gap-4">
                  <FaVideo className='size-6 text-teal-500'/> 
                  Video Conversion
                </Link>
              </li>
              <li 
                className="block p-6 flex items-center gap-4 justify-between text-gray-700 hover:bg-gray-100 xl:hidden"
              >
                <Link to="/image-conversion" className="flex items-center gap-4">
                  <FaImage className='size-6 text-teal-500'/> 
                  Image Conversion
                </Link>
              </li>
              <li 
                className="block p-6 flex items-center gap-4 justify-between text-gray-700 hover:bg-gray-100 xl:hidden"
              >
                <Link to="/document-conversion" className="flex items-center gap-4">
                  <IoMdDocument className='size-6 text-teal-500'/> 
                  Document Conversion
                </Link>
              </li>
            </ul>
            <ul className="py-1 hidden xl:block">
              <li className="p-6 flex items-center gap-4 justify-between text-gray-700 hover:bg-gray-100" onMouseEnter={handleMouseEnterVideo} onMouseLeave={handleMouseLeaveVideo}>
                <FaVideo className='size-6 text-teal-500'/> 
                <span className="hidden xl:inline-block">Video Conversion</span>
                <IoIosArrowForward className='size-6 text-gray-800'/>
              </li>
              <li className="p-6 text-gray-400 gap-4 cursor-not-allowed flex items-center hover:bg-gray-100">
                <FaImage className='size-8'/> 
                <span className="hidden xl:inline-block">Image Conversion</span>
                <IoIosArrowForward className='size-6'/>
              </li>
              <li className="p-6 text-gray-400 gap-4 cursor-not-allowed flex items-center hover:bg-gray-100">
                <IoMdDocument className='size-8'/> 
                <span className="hidden xl:inline-block">Document Conversion</span>
                <IoIosArrowForward className='size-6'/>
              </li>
            </ul>
          </div>
        )}
      </div>
      {(isVideoHovered) && (
        <div
          className="hidden xl:block absolute top-10 p-4 mt-0 text-lg h-80 bg-white shadow-lg rounded-r-lg z-20"
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