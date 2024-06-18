import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [conversions, setConversions] = useState([]);

  useEffect(() => {
    fetch('/conversions.json')
      .then(response => response.json())
      .then(data => setConversions(data))
      .catch(error => console.error('Error fetching conversions:', error));
  }, []);

  return (
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-6 justify-between text-center">
            <div className="w-full sm:w-2/6 lg:w-1/3 flex items-center sm:items-start justify-center sm:justify-normal mb-4 lg:mb-0">
              <img src="/medialogo.svg" alt="Company Logo" className="w-8 h-8 lg:w-12 lg:h-12 mr-2 mb-4" />
              <span className="text-base lg:text-lg font-bold text-teal-400 mb-4 sm:mt-1 lg:mt-2">Media Convert</span>
            </div>
            <div className="w-full sm:w-4/6 lg:w-2/3 flex flex-col sm:flex-row justify-between">
              <div className="w-full sm:w-1/2">
                <h4 className="text-base lg:text-lg font-bold mb-4 text-teal-400">Product Features</h4>
                <ul>
                  <li className="mb-2"><a href="/video-converter" className="text-gray-400 text-xs md:text-sm lg:text-base hover:text-white">Video converter</a></li>
                  <li className="mb-2"><a href="#" className="text-gray-400 text-xs md:text-sm lg:text-base hover:text-white">Image converter <sup className="border border-orange-500 rounded-full py-1 text-xs px-1">coming soon</sup></a></li>
                  <li className="mb-2"><a href="#" className="text-gray-400 text-xs md:text-sm lg:text-base hover:text-white">Document converter <sup className="border border-orange-500 rounded-full py-1 text-xs px-1">coming soon</sup></a></li>
                </ul>
              </div>
              <div className="w-full sm:w-1/2 mt-6 sm:mt-0">
                <h4 className="text-base lg:text-lg font-bold mb-4 text-teal-400">Video Converter</h4>
                <ul>
                  {conversions.map((conversion, index) => (
                    <li key={index} className="mb-2">
                      <Link to={`/video-converter/${conversion.format.toLowerCase()}`} className="text-xs md:text-sm lg:text-base text-gray-400 hover:text-white">{conversion.format} converter</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <p className="text-sm text-center text-gray-400 mt-6">&copy; 2024 Media Convert. All Rights Reserved.</p>
        </div>
      </footer>
    );
  };
export default Footer;
