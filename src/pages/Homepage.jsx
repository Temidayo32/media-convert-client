// HomePage.jsx
import React from 'react';
import { HeroSection, Signupmodal, VideoSection } from '../components';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <VideoSection/>
      <Signupmodal/>
      {/* Add other sections/components here */}
    </div>
  );
};

export default HomePage;
