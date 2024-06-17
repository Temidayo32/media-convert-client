import React, {useState, useEffect} from 'react'
import { useParams, useLocation } from 'react-router-dom';
import { VideoHero, VideoSection, HowToConvert, FaqSection } from '../components'

function VideoConverter() {
  const [key, setKey] = useState(0);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); 
    setKey((prevKey) => prevKey + 1);
  }, [ location.pathname]);


  return (
    <div key={key}>
        <VideoHero/>
        <VideoSection numConversionsToShow={6} numConversions={16} hideButton={false} moreLess={true} />
        <HowToConvert/>
        <FaqSection/>
      
    </div>
  )
}

export default VideoConverter
