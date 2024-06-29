import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import { FaArrowRight } from 'react-icons/fa';

const VideoSection = ({ numConversionsToShow, numConversions, hideButton, moreLess }) => {
  const [conversions, setConversions] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    fetch('/conversions.json')
      .then(response => response.json())
      .then(data => setConversions(data.videos))
      .catch(error => console.error('Error fetching conversions:', error));
  }, []);

  // Define breakpoints and number of conversions to show for sm and md screens
  const breakpoints = {
    sm: 2,    
    md: 3     
  };

  const conversionsBreakpoints = {
    sm: 2,    
    md: 4     
  };

  // Function to determine number of conversions to show based on screen size
  const getNumConversionsToShow = () => {
    const windowWidth = window.innerWidth;
    if (windowWidth >= 1024) { 
      return numConversionsToShow; 
    } else if (windowWidth >= 768) {
      return breakpoints.md;
    } else { 
      return breakpoints.sm;
    }
  };

  const getNumConversions = () => {
    const windowWidth = window.innerWidth;
    if (windowWidth >= 1024) { 
      return numConversions; 
    } else if (windowWidth >= 768) {
      return conversionsBreakpoints.md;
    } else { 
      return conversionsBreakpoints.sm;
    }
  };

  const initialNumToShow = getNumConversionsToShow();
  const initialNumConversions = getNumConversions();
  const [currentNumToShow, setCurrentNumToShow] = useState(initialNumToShow);
  const [currentNumConversions, setCurrentNumConversions] = useState(initialNumConversions);

  const handleShowMore = () => {
    setCurrentNumConversions(prevNum => prevNum + 4);
    setShowMore(true);
  };

  const handleShowLess = () => {
    setCurrentNumConversions(prevNum => {
      const newNum = prevNum - 4;
      if (newNum <= initialNumConversions) {
        setShowMore(false);
        return initialNumConversions;
      }
      return newNum;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setCurrentNumToShow(getNumConversionsToShow());
      setCurrentNumConversions(getNumConversions());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <section className="pt-20 pb-10 bg-orange-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-teal-800">Video Conversion</h2>
          <p className="text-sm md:text-lg text-gray-700">Convert your videos to any format with ease.</p>
        </div>
        <div className="flex justify-center items-center">
          <div className="flex items-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-16">
              {conversions.slice(0, currentNumToShow).map((conversion, index) => (
                <div key={index} className="text-center">
                  <div className="bg-white flex justify-center rounded-full p-4 mb-4">
                    <img
                      src={conversion.icon}
                      alt={`${conversion.format} Icon`}
                      className="w-12 h-12 cursor-pointer text-green-500"
                    />
                  </div>
                  <p className="text-teal-800 text-sm md:text-lg">{conversion.format}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-12 grid grid-cols-1 px-12 md:px-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {conversions.slice(0, currentNumConversions).map((conversion, index) => (
          <Card
            key={index}
            format={conversion.format}
            icon={conversion.icon}
            description={conversion.description}
          />
        ))}
      </div>

      {moreLess && (
        <div className="flex justify-center gap-2 mt-8">
        {currentNumConversions < conversions.length && (
          <button onClick={handleShowMore} className="hover:text-white text-teal-700 bg-white inline-block hover:bg-teal-700 border border-teal-100 py-2 px-4 rounded shadow-md transition duration-300">
            Show More
          </button>
        )}
        {showMore && currentNumConversions > initialNumConversions && (
          <button onClick={handleShowLess} className="hover:text-white text-teal-700 bg-white inline-block hover:bg-teal-700 border border-teal-100 py-2 px-4 rounded shadow-md transition duration-300">
            Show Less
          </button>
        )}
      </div>
      )}

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
