import React, {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection, Signupmodal, VideoSection, Audience } from '../components';

const HomePage = () => {
  const [key, setKey] = useState(0);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); 
    setKey((prevKey) => prevKey + 1);
  }, [ location.pathname]);

  return (
    <div key={key}>
      <HeroSection />
      <VideoSection numConversionsToShow={6} numConversions={4} hideButton={true} moreLess={false} />
      <Audience/>
      <Signupmodal/>
      {/* Add other sections/components here */}
    </div>
  );
};

export default HomePage;
