import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import { useData } from '../DataContext';
import { Conversion } from '../components';

const DownloadPage = () => {
  const { format } = useParams();
  const { setDownloadPageActive, uploadedVideos } = useData();
  const [key, setKey] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    setKey((prevKey) => prevKey + 1);
  }, [format, location.pathname]);

  useEffect(() => {
    const handleBackButton = () => {
      setDownloadPageActive(false);
      navigate('/');
    };

    window.addEventListener('popstate', handleBackButton);

    // return () => {
    //   console.log('popstate detected!')
    //   window.removeEventListener('popstate', handleBackButton);
    // };
  }, [setDownloadPageActive, navigate]);

  
  if (uploadedVideos.length === 0) {
    setDownloadPageActive(false);
    navigate('/')
  }

  return (
    <div className="container mx-auto py-20" key={key}>
      <h1 className="text-5xl py-4 text-center font-bold text-teal-800">Download Results</h1>
      <Conversion />
    </div>
  );
};

export default DownloadPage;
