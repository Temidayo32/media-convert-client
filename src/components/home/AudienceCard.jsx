import React from 'react';

const AudienceCard = ({ backgroundImage, title, description }) => {
  return (
    <div className="relative max-w-sm rounded overflow-hidden shadow-lg bg-white h-80">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      <div className="relative px-6 py-4 bg-black bg-opacity-50 h-full flex flex-col justify-center items-center text-center">
        <div className="font-bold text-lg sm:text-xl md:text-2xl mb-2 text-white">{title}</div>
        <p className="text-sm sm:text-base md:text-lg text-gray-200">{description}</p>
      </div>
    </div>
  );
};

export default AudienceCard;
