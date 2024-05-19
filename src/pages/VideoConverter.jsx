import React, {useState, useEffect} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { UploadVideo } from '../components';

const VideoConverter = () => {
  const { format } = useParams();
  const [key, setKey] = useState(0);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); 
    setKey((prevKey) => prevKey + 1);
  }, [format, location.pathname]);

  
  return (
    <div className="container mx-auto py-20"  key={key}>
      <h1 className="text-5xl py-4 text-center font-bold text-teal-800">{format.toUpperCase()} Converter</h1>
      <p className="text-gray-700 text-lg text-center">Convert your videos to {format.toUpperCase()} format, for free.</p>
      <UploadVideo defaultFormat={format} />
    </div>
  );
};

export default VideoConverter;
