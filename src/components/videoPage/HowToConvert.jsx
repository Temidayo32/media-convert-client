import React from 'react';
import { FaFileVideo, FaFolderOpen, FaPlay, FaDownload } from 'react-icons/fa'; // Importing Font Awesome icons

const HowToConvert = () => {
  const steps = [
    {
      number: 1,
      icon: <FaFileVideo className="text-teal-700 w-6 h-6 md:w-8 md:h-8" />,
      description: 'Select from one of Convert Quickly video converters. e.g. MOV converter.',
    },
    {
      number: 2,
      icon: <FaFolderOpen className="text-teal-700 w-6 h-6 md:w-8 md:h-8" />,
      description: 'Using the "Choose Files" button, select files from your local machine, Dropbox, and Google Drive.',
    },
    {
      number: 3,
      icon: <FaPlay className="text-teal-700 w-6 h-6 md:w-8 md:h-8" />,
      description: 'Click the "Convert" button to commence converting.',
    },
    {
      number: 4,
      icon: <FaDownload className="text-teal-700 w-6 h-6 md:w-8 md:h-8" />,
      description: 'Download your converted files.',
    },
  ];

    return (
      <section className="bg-white pt-8 py-2 lg:pb-20 lg:pt-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-teal-800 mb-8">How to Convert Video Online?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="flex items-center justify-center bg-teal-100 rounded-full w-8 h-8 md:w-16 md:h-16 mb-4">
                  <span className="text-lg md:text-xl font-bold text-teal-700">{step.number}</span>
                </div>
                <div className="flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <p className="text-sm md:text-lg text-gray-700">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  

export default HowToConvert;
