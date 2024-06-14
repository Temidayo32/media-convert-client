import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import { FaArrowRight } from 'react-icons/fa';

const VideoSection = ({ numConversionsToShow, numConversions, hideButton }) => {
  const [conversions, setConversions] = useState([]);

  useEffect(() => {
    fetch('/conversions.json')
      .then(response => response.json())
      .then(data => setConversions(data))
      .catch(error => console.error('Error fetching conversions:', error));
  }, []);

  return (
    <section className="pt-20 pb-10 bg-orange-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-teal-800">Video Conversion</h2>
          <p className="text-lg text-gray-700">Convert your videos to any format with ease.</p>
        </div>
        <div className="flex justify-center items-center">
          <div className="flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-16">
              {conversions.slice(0, numConversionsToShow).map((conversion, index) => (
                <div key={index} className="text-center">
                  <div className="bg-white flex justify-center rounded-full p-4 mb-4">
                    <img
                      src={conversion.icon}
                      alt={`${conversion.format} Icon`}
                      className="w-12 h-12 cursor-pointer text-green-500"
                    />
                  </div>
                  <p className="text-teal-800">{conversion.format}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {conversions.slice(0, numConversions).map((conversion, index) => (
          <Card
            key={index}
            format={conversion.format}
            icon={conversion.icon}
            description={conversion.description}
          />
        ))}
      </div>
      {hideButton && <div className="flex items-center justify-center p-4 mt-8">
        <Link
          to='/video-converter'
          className="flex justify-center items-center hover:text-white text-teal-700 bg-white inline-block hover:bg-teal-700 border border-teal-100 py-4 px-8 rounded shadow-md transition duration-300"
        >
          MORE FORMAT <FaArrowRight className="ml-2" />
        </Link>
      </div>
      }
    </section>
  );
};

export default VideoSection;
