import React, { useEffect, useState } from 'react';
import { useData } from '../../DataContext';
import io from 'socket.io-client';

import { MdDelete } from "react-icons/md";

const socket = io('http://localhost:8000'); 

const Conversion = () => {
  const { uploadedVideos, setUploadedVideos } = useData();
  const [progress, setProgress] = useState({});
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    const handleConversionProgress = (data) => {
        setProgress(prevProgress => ({
            ...prevProgress,
            [data.jobId]: data.progress,
        }));
        
        if (data.progress === 'completed' && data.url) {
            setDownloadUrl(data.url);
        }
    };

    socket.on('conversion_progress', handleConversionProgress);

    return () => {
        socket.off('conversion_progress', handleConversionProgress);
    };  
  }, []);

    console.log('download:', downloadUrl)
  const handleRemoveVideo = (index) => {
        const newVideos = [...uploadedVideos];
        newVideos.splice(index, 1);
        setUploadedVideos(newVideos);
    };
    const colorMap = {
      processing: 'bg-orange-500',
      uploading: 'bg-blue-500',
      converting: 'bg-yellow-500',
      // optimizing: 'bg-purple-500',
      finalizing: 'bg-indigo-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
      pending: 'bg-gray-500', // Adding 'failed' status for completeness
  };
  

  const getProgressColorClass = (progressStatus) => {
        return colorMap[progressStatus] || colorMap.pending;
    };
    

    const getProgressPercentage = (jobId) => {
      const progressValue = progress[jobId];
      console.log("progress:", progress);
  
      switch (progressValue) {
          case 'completed':
              return 100;
          case 'processing':
              return 25;
          case 'converting':
              return 50;
          case 'uploading':
              return 75;
          case 'failed':
              return 100;
          default:
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
              <span className="text-teal-800 text-lg font-semibold">{video.name}</span>
            </div>
            <div className='flex items-center justify-start ml-12 w-7/12'>
            <div className="relative w-48 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`absolute left-0 top-0 ${getProgressColorClass(progress[video.jobId])} h-full rounded-full`}
                        style={{
                            width: `${getProgressPercentage(video.jobId)}%`,
                            transition: 'width 4s ease-in-out',
                            animation: progress[video.jobId] === 'completed' || progress[video.jobId] === 'failed' ? 'none' : 'radiate 5s linear', 
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
                    onClick={() => {
                      if (progress[video.jobId] === 'completed' && downloadUrl) {
                          const link = document.createElement('a');
                          link.href = downloadUrl;
                          link.download = `${video.name.split('.')[0]}.${video.format}`
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                      }
                  }}
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
      <p className='text-gray-400 ml-2 my-2'>Converted files are automatically deleted after 8 hours to protect your privacy. Please download your files before they are deleted</p>
    </div>
  );
};

export default Conversion;