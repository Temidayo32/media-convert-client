import React from 'react';

const VideoHero = () => {
  return (
    <div className="bg-teal-500 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl sm:text-7xl font-bold text-orange-200 leading-tight mb-6">
            Video Converter
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 mb-8">
            Convert videos effortlessly with our versatile Video Converter.
            It supports up to 16 different formats, ensuring compatibility with your needs.
          </p>
          <p className="text-sm text-gray-100">
            *Formats include MP4, AVI, MOV, WMV, and more.
          </p>
        </div>
        <img 
          src="/videoHero.svg" 
          alt="Video Converter" 
          className="mt-8 mx-auto max-w-2xl"
        />
      </div>
    </div>
  );
};

export default VideoHero;
