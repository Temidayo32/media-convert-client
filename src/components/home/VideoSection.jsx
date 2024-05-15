import React, {useState, useEffect} from 'react';
import Card from './Card';

const VideoSection = () => {
  const [conversions, setConversions] = useState([]);

  useEffect(() => {
    fetch('/conversions.json')
      .then(response => response.json())
      .then(data => setConversions(data))
      .catch(error => console.error('Error fetching conversions:', error));
  }, []);

  return (
    <section className="py-20 bg-orange-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-teal-800">Video Conversion</h2>
          <p className="text-lg text-gray-700">Convert your videos to any format with ease.</p>
        </div>
        <div className="flex justify-center items-center">
          <div className="flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-16">
              {conversions.map((conversion, index) => (
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
        {conversions.map((conversion, index) => (
          <Card
            key={index}
            format={conversion.format}
            icon={conversion.icon}
            description={conversion.description}
          />
        ))}
      </div>
    </section>
  );
};

export default VideoSection;
