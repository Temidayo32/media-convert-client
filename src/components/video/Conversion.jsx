import React, { useEffect, useState } from 'react';
import { useData } from '../../DataContext';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../config/firebase_config';
import io from 'socket.io-client';

import { MdDelete } from "react-icons/md";
import DownloadOptions from './DownloadOptions';

const socket = io('http://localhost:8000'); 

const Conversion = () => {
  const { uploadedVideos, setUploadedVideos } = useData();
  const [progress, setProgress] = useState({});
  const [downloadUrl, setDownloadUrl] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const userId = user.uid;
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
            if (change.type === "modified" || change.type === "added") {
                const data = change.doc.data();
                const jobId = change.doc.id;

                setProgress((prevProgress) => ({
                    ...prevProgress,
                    [jobId]: data.progress,
                }));

                if (data.progress === 'completed' && data.fileUrl) {
                    setDownloadUrl(data.fileUrl);
                }
            }
        });
    });

    return () => unsubscribe();
}, [user]);

useEffect(() => {
  if (user) return;

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

}, [socket]);


    // console.log('download:', downloadUrl)
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
      pending: 'bg-gray-500', 
  };
  

  const getProgressColorClass = (progressStatus) => {
        return colorMap[progressStatus] || colorMap.pending;
    };
    

    const getProgressPercentage = (jobId) => {
      const progressValue = progress[jobId];
      // console.log("progress:", progress);
  
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
    <div className="container mx-0 lg:mx-auto w-full lg:w-4/5 bg-white p-4 sm:p-8 rounded-lg shadow-lg">
      <ul className="space-y-4">
        {uploadedVideos.map((video, index) => (
          <li key={index} className="flex flex-col gap-4 sm:flex-row sm:gap-0 justify-between items-center border border-gray-300 p-4 rounded-lg">
            <div className='flex flex-col sm:flex-row w-full md:w-8/12 justify-center'>
              <div className='flex flex-col w-full sm:w-7/12'>
                <span className="text-teal-800 text-center sm:text-left mb-4 sm:mb-0 text-sm lg:text-base font-semibold">{video.name}</span>
              </div>
              <div className='flex items-center sm:ml-12 lg:ml-0 lg:justify-start justify-center w-full sm:w-5/12 mt-2 sm:mt-0'>
                <div className="relative w-3/5 sm:w-48 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 ${getProgressColorClass(progress[video.jobId])} h-full rounded-full`}
                    style={{
                      width: `${getProgressPercentage(video.jobId)}%`,
                      transition: 'width 4s ease-in-out',
                      animation: progress[video.jobId] === 'completed' || progress[video.jobId] === 'failed' ? 'none' : 'radiate 3s linear',
                    }}
                  />
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs sm:text-sm">{progress[video.jobId] || 'Pending'}</span>
                </div>
              </div>
            </div>
            <div className='flex items-center justify-center sm:justify-end sm:ml-2 gap-6 w-full md:w-4/12 mt-4 sm:mt-0'>
              <DownloadOptions
                video={video}
                downloadUrl={downloadUrl}
                progress={progress[video.jobId]}
              />
              <button title="Delete" onClick={() => handleRemoveVideo(index)}>
                <MdDelete className="text-2xl text-gray-500 hover:text-red-600 transform hover:scale-110 transition-colors duration-300" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className='text-gray-400 text-xs md:text-sm lg:text-base mt-4 text-center sm:text-left'>
        Converted files are automatically deleted after 8 hours to protect your privacy. Please download your files before they are deleted.
      </p>
    </div>
  );
};

export default Conversion;
