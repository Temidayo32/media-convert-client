import React, {useState, useEffect} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { UploadVideo, HowToConvert, FaqSection } from '../components';

const SingleVideoConverter = () => {
  const { format } = useParams();
  const [key, setKey] = useState(0);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); 
    setKey((prevKey) => prevKey + 1);
  }, [format, location.pathname]);

  
  return (
    <div className="container mx-auto py-20 mt-12"  key={key}>
      <h1 className="text-3xl md:text-4xl lg:text-5xl py-4 text-center font-bold text-teal-800">{format.toUpperCase()} Converter</h1>
      <p className="text-gray-700 text-sm md:text-lg text-center">Convert your videos to {format.toUpperCase()} format, for free.</p>
      <UploadVideo defaultFormat={format} />
      <HowToConvert />
      <FaqSection/>
    </div>
    
  );
};

export default SingleVideoConverter;
