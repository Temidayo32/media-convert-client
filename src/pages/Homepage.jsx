// HomePage.jsx
import React from 'react';
import { HeroSection, Signupmodal, VideoSection } from '../components';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <VideoSection numConversionsToShow={6} numConversions={4} hideButton={true}  />
      <Signupmodal/>
      {/* Add other sections/components here */}
    </div>
  );
};

export default HomePage;
