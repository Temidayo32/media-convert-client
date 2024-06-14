import React from 'react'
import { VideoHero, VideoSection, HowToConvert } from '../components'

function VideoConverter() {
  return (
    <div>
        <VideoHero/>
        <VideoSection numConversionsToShow={6} numConversions={16} hideButton={false} />
        <HowToConvert/>
      
    </div>
  )
}

export default VideoConverter
