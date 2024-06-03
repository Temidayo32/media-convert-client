import React from 'react';
import { Link } from 'react-router-dom';

function NestedOptions({ conversions }) {
  return (
    <div className='grid grid-cols-3 gap-2'>
      {conversions.map((conversion, index) => (
        <div key={index} className="text-gray-700 hover:text-teal-500 transition-transform duration-300 ease-in-out transition-colors hover:bg-gray-100 p-2 py-6 text-lg">
          <Link to={`/video-converter/${conversion.format.toLowerCase()}`} className="block flex items-center">
            <img src={`${conversion.icon}`} alt="Hero" className="w-8 h-8 mr-2" />
            {conversion.format} Converter
          </Link>
        </div>
      ))}
    </div>
  );
}

export default NestedOptions;
