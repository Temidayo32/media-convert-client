import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Card = ({ format, icon, description }) => {
  return (
    <div className="flex justify-center flex-col bg-white p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-teal-50">
      <div className="flex justify-center items-center mb-4">
        <img src={icon} alt={`${format} Icon`} className="w-8 h-8" />
        <h3 className="text-xl text-green-800 ml-4">{format} Converter</h3>
      </div>
      <p className="text-gray-700 text-center mb-12">{description}</p>
      <Link to={`/video-converter/${format.toLowerCase()}`} className="bg-teal-800 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center transition-colors duration-300">
        START <FaArrowRight className="ml-1" />
      </Link>
    </div>
  );
};

export default Card;
