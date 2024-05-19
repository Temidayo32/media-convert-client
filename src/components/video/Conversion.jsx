import React, { useEffect, useState } from 'react';
import { useData } from '../../DataContext';
import io from 'socket.io-client';

import { MdDelete } from "react-icons/md";

const socket = io('http://localhost:8000'); 

const Conversion = () => {
  const { uploadedVideos, setUploadedVideos } = useData();
  const [progress, setProgress] = useState({});

  useEffect(() => {
    socket.on('conversion_progress', (data) => {
      setProgress(prevProgress => ({
        ...prevProgress,
        [data.jobId]: data.progress,
      }));
    });

    return () => {
      socket.off('conversion_progress');
    };
  }, []);
  
  const handleRemoveVideo = (index) => {
        const newVideos = [...uploadedVideos];
        newVideos.splice(index, 1);
        setUploadedVideos(newVideos);
    };
  const colorMap = {
        processing: 'bg-orange-500',
        completed: 'bg-green-500',
        pending: 'bg-gray-500',
    };

  const getProgressColorClass = (progressStatus) => {
        return colorMap[progressStatus] || colorMap.pending;
    };
    

  const getProgressPercentage = (jobId) => {
        const progressValue = progress[jobId];
        console.log("progress:", progress)
        if (progressValue === 'completed') {
          return 100;
        } else if (progressValue === 'processing') {
          return 50;
        } else if (progressValue === 'failed') {
          return 0;
        } else {
          return 0;
        }
      };

  return (
    <div className="container mx-auto w-2/3 bg-white p-8 rounded-lg shadow-lg">
      <ul>
        {uploadedVideos.map((video, index) => (
          <li key={index} className="flex justify-between items-center m-px border w-full py-4 px-4 border-gray-300 pb-2">
          <div className='flex w-9/12'>
            <div className='flex flex-col w-5/12'>
              <span className="text-teal-800 text-xl font-semibold">{video.name}</span>
            </div>
            <div className='flex items-center justify-start w-7/12'>
            <div className="relative w-60 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`absolute left-0 top-0 ${getProgressColorClass(progress[video.jobId])} h-full rounded-full`}
                        style={{
                            width: `${getProgressPercentage(video.jobId)}%`,
                            transition: 'width 4s ease-in-out',
                            animation: progress[video.jobId] === 'completed' ? 'none' : 'radiate 6s infinite', 
                        }}
                    />
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm">{progress[video.jobId] || 'Pending'}</span>
                </div>
                </div>
          </div>
          <div className='flex items-center gap-6 w-3/12'>
                <button
                    className={`py-2 px-6 text-xl rounded transition-colors duration-300 ${progress[video.jobId] === 'completed' ? 'bg-teal-500 hover:bg-teal-600 shadow-2xl drop-shadow-2xl text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                    title="download"
                    onClick={() => console.log('downloaded')}
                    disabled={progress[video.jobId] !== 'completed'}
                >
                    Download
                </button>
            <button title="Delete" onClick={() => handleRemoveVideo(index)}>
                <MdDelete className="text-2xl text-gray-500 hover:text-red-600 transform hover:scale-110 transition transition-colors duration-300" />
            </button>
          </div>
        </li>
        ))}
      </ul>
    </div>
  );
};

export default Conversion;
