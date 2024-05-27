import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

import { FaFileCirclePlus } from "react-icons/fa6";
import { IoIosArrowDropdownCircle } from 'react-icons/io';
import { BsGearFill } from 'react-icons/bs';
import { MdDelete } from "react-icons/md";

import useDrivePicker from 'react-google-drive-picker';

import { clientId, developerKey, azureClientId } from '../../config/key';
import UploadOptions from './UploadOptions';
import AdvancedOptions from './AdvancedOptions';
import { useData } from '../../DataContext';


const defaultSettings = {
  selectedCodec: '',
  selectedFrameRate: '',
  selectedResolution: '',
  selectedScale: { width: '', height: '' },
  selectedCropFilter: '',
  selectedRotateFilter: '',
  deshakeChecked: false,
  selectedDenoise: '',
  selectedAspectRatio: '',
  selectedAudioCodec: '',
  volume: 1,
  noAudio: false,
};

const socket = io('http://localhost:8000'); 

const UploadVideo = ({defaultFormat}) => {
  const navigate = useNavigate();
  const { format: currentFormat } = useParams();
  const { uploadedVideos, setUploadedVideos, setDownloadPageActive } = useData();
  const { showSignUpOptions, setShowSignUpOptions, emailVerified } = useData();
  const [openPicker, authResponse] = useDrivePicker();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(true);
  const [formats, setFormats] = useState([]);
  const [previousFormat, setPreviousFormat] = useState(null);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  
  const { idToken } = useData();
  // console.log(emailVerified)
  // console.log(idToken)


  useEffect(() => {
    fetch('/conversions.json')
      .then(response => response.json())
      .then(data => setFormats(data))
      .catch(error => console.error('Error fetching conversions:', error));
  }, []);

  useEffect(() => {
    setShowUploadForm(uploadedVideos.length === 0);
  }, [uploadedVideos]);

  useEffect(() => {
      if (currentFormat !== previousFormat) {
        setPreviousFormat(currentFormat);
        setUploadedVideos([]);
        }

  }, [setUploadedVideos, currentFormat, previousFormat]);

  useEffect(() => {
    socket.on('limitExceeded', (data) => {
      setLimitExceeded(true);
      setLimitMessage(data.message)
      setFadeOut(false);
    });

    // Cleanup on component unmount
    return () => {
      socket.off('limitExceeded');
    };
  }, [])

  useEffect(() => {
    if (limitExceeded) {
      const fadeTimer = setTimeout(() => {
        setFadeOut(true); // Start fade-out transition
      }, 4500); // Start fading out before the actual removal
      const hideTimer = setTimeout(() => {
        setLimitExceeded(false);
      }, 5000); // Hide the notification after it has faded out
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [limitExceeded]);

  const defaultOption = formats.find((format) => format.format.toLowerCase() === defaultFormat.toLowerCase());

  // const randomSessionID = 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'


  // setCookie('sessionID', randomSessionID, { path:'/convert', maxAge: 3600000, httpOnly: true, sameSite: 'none', secure: true });


  function formatFileSize(bytes) {
    const mbSize = bytes / (1024 * 1024);
    if (mbSize < 1024) {
      return mbSize.toFixed(2) + ' MB';
    } else {
      const gbSize = mbSize / 1024;
      return gbSize.toFixed(2) + ' GB';
    }
  }

  // Handler for file selection
  const handleFileSelected = (e) => {
    console.log('File selected:', e.detail);
    // Handle the selected file
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    const newVideos = [...uploadedVideos];
    for (let i = 0; i < files.length; i++) {
      newVideos.push({
        source: 'local',
        file: files[i],
        name: files[i].name,
        size: formatFileSize(files[i].size),
        format: defaultFormat,
        jobId: `${Date.now()}_${files[i].name.split('.')[0]}`,
        settings: { ...defaultSettings },
      });
    }
    setUploadedVideos(newVideos);
    setShowUploadForm(false);
  };

  const onSuccess = (files) => {
    const newVideos = [...uploadedVideos];
    for (let i = 0; i < files.length; i++) {
      newVideos.push({
        source: 'dropbox',
        file: files[i],
        name: files[i].name,
        fileLink: files[i].link,
        size: formatFileSize(files[i].bytes),
        format: defaultFormat,
        jobId: `${Date.now()}_${files[i].name.split('.')[0]}`,
        settings: { ...defaultSettings },
      });
    }
    console.log(files)
    setUploadedVideos(newVideos);
    setShowUploadForm(false);
  };

  const onCancel = () => {
    console.log('Cancelled');
  };

  const handleOpenPicker = () => {
    openPicker({
      clientId: clientId,
      developerKey: developerKey,
      viewId: 'DOCS_VIDEOS',
      supportDrives: true,
      multiselect: true,
      mimeTypes: ['video/*'],
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button');
        } else if(data.docs) {
          const selectedVideos = data.docs.filter(doc => doc.mimeType.startsWith('video/'));
          // console.log('Selected videos:', selectedVideos);
          const newVideos = [...uploadedVideos];
          for (let i = 0; i < selectedVideos.length; i++) {
            newVideos.push({
              source: 'google',
              file: selectedVideos[i],
              fileId: selectedVideos[i].id,
              name: selectedVideos[i].name,
              size: formatFileSize(selectedVideos[i].sizeBytes),
              format: defaultFormat,
              jobId: `${Date.now()}_${selectedVideos[i].name.split('.')[0]}`,
              settings: { ...defaultSettings },
            });
          }
          setUploadedVideos(newVideos);
          setShowUploadForm(false);
        }
      },
    });
  };

  const handleRemoveVideo = (index) => {
    const newVideos = [...uploadedVideos];
    newVideos.splice(index, 1);
    setUploadedVideos(newVideos);
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: 50,
    }),
  };

  const handleConvertVideos = () => {
    // Convert uploaded video
    uploadedVideos.forEach((video) => {
      const fileNameWithoutExtension = video.name.split('.')[0];
      const fileExtension = video.name.split('.')[1];

      const formData = new FormData();
      formData.append('source', video.source);
      formData.append('video', video.file)
      formData.append('videoId', video.fileId);
      formData.append('jobId', video.jobId)
      formData.append('dropboxPath', video.fileLink)
      formData.append('videoName', fileNameWithoutExtension);
      formData.append('videoExt', fileExtension)
      formData.append('videoSize', video.size);
      formData.append('videoFormat', video.format);
      formData.append('videoSettings', JSON.stringify(video.settings))
      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}: ${value}`);
      // }
  
      // Determine the correct endpoint
    let endpoint;
    if (emailVerified) {
      endpoint = video.source === 'local' ? '/signed/convert' : '/signed/convertcloud';
    } else {
      endpoint = video.source === 'local' ? '/convert' : '/convertcloud';
    }

    // Set up headers
    const headers = {
      'Content-Type': 'multipart/form-data'
    };

    if (idToken && emailVerified) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    
    const requestURL = endpoint;

    axios.post(requestURL, formData, { headers, withCredentials: true })
      .then(data => console.log(data))
      .then(() => {
        console.log('Navigating to conversion-progress page');
        setDownloadPageActive(true);
        navigate('/download');
      })
      .catch((error) => {
        console.error('Error converting video:', error);
      });
  });
  };

  const updateVideoSettings = (videoId, newSettings) => {
    setUploadedVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.jobId === videoId ? { ...video, settings: newSettings } : video
      )
    );
  };

  const resetVideoSettings = (videoId) => {
    const defaultSetting = {...defaultSettings}
    setUploadedVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.jobId === videoId ? { ...video, settings: defaultSetting } : video
      )
    );
  };

  const openModal = (videoId) => {
    setCurrentVideoId(videoId);
  };

  const closeModal = () => {
    setCurrentVideoId(null);
  };

  const toggleSignUpOptions = () => {
    setShowSignUpOptions(!showSignUpOptions);
};
  
 
  return (
    <div className="container mx-auto py-8">
      {limitExceeded && (
        <div className={`fixed top-24 right-5 bg-red-500 z-20 text-white p-4 rounded-lg shadow-lg transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          {limitMessage}
        </div>
      )}
      {currentVideoId !== null && (
        <AdvancedOptions
          onClose={closeModal}
          formData={uploadedVideos.find((video) => video.jobId === currentVideoId).settings}
          fileName={uploadedVideos.find((video) => video.jobId === currentVideoId).name}
          fileSize={uploadedVideos.find((video) => video.jobId === currentVideoId).size}
          onChange={(newSettings) => updateVideoSettings(currentVideoId, newSettings)}
          resetData={() => resetVideoSettings(currentVideoId)}
        />
      )}
      {showUploadForm ? (
        <div className="flex flex-col items-center justify-center w-2/3 h-64 mx-auto bg-teal-50 p-8 rounded-lg border-dashed border-4 border-teal-400">
          <div 
            className="relative w-2/5 h-1/2 bg-teal-500 rounded-lg shadow-lg flex items-center justify-between px-6"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <FaFileCirclePlus className="text-white text-4xl" />
            <span className="text-white text-3xl pr-2 font-semibold cursor-pointer">Choose Files</span>
            <div className="h-20 w-0.5 bg-teal-400"></div>
            <IoIosArrowDropdownCircle className="text-white text-4xl cursor-pointer" />
            { showDropdown && 
              <UploadOptions 
                handleFileUpload={handleFileUpload} 
                handleOpenPicker={handleOpenPicker} 
                onSuccess={onSuccess} 
                onCancel={onCancel} 
                handleFileSelected={handleFileSelected} />
            }
          </div>
          <p className="text-center text-gray-500">
            Max file size 1GB. <button className='underline underline-offset-2' onClick={toggleSignUpOptions}>Sign up</button> for more
          </p>
          {!emailVerified && (<p className='text-center text-gray-500 mt-auto text-xs'>*Limit 5 conversions/day</p>)}
      </div>
      ) : (
        <div className="w-2/3 mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-teal-800 text-3xl font-semibold">Uploaded Videos</span>
          <div 
            className="relative w-2/5 h-1/2 bg-teal-500 rounded-lg shadow-lg z-10 flex items-center justify-between px-6"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <FaFileCirclePlus className="text-white text-4xl" />
            <span className="text-white text-2xl pr-2 font-semibold cursor-pointer">Add More Files</span>
            <div className="h-20 w-0.5 bg-teal-400"></div>
            <IoIosArrowDropdownCircle className="text-white text-4xl cursor-pointer" />
            { showDropdown && 
              <UploadOptions 
                handleFileUpload={handleFileUpload} 
                handleOpenPicker={handleOpenPicker} 
                onSuccess={onSuccess} 
                onCancel={onCancel} 
                handleFileSelected={handleFileSelected} />
          }
          </div>
        </div>
        <ul>
          {uploadedVideos.map((video, index) => (
            <li key={index} className="flex justify-between items-center m-px border w-full py-4 px-4 border-gray-300 pb-2">
            <div className='flex w-5/6'>
              <div className='flex flex-col w-2/3'>
                <span className="text-teal-800 text-xl font-semibold">{video.name}</span>
                <span className="text-gray-500 text-lg ml-2">{video.size}</span>
              </div>
              <div className='flex items-center justify-end w-1/3'>
                <p className='text-lg pr-2 text-gray-500'>Output:</p>
                <Select
                  options={formats.map((format) => ({ label: format.format, value: format.format.toLowerCase() }))}
                  defaultValue={{ label: defaultOption.format, value: defaultOption.format }}
                  onChange={(selectedOption) => {
                    const newVideos = [...uploadedVideos];
                    newVideos[index].format = selectedOption.value;
                    setUploadedVideos(newVideos);
                    // console.log(newVideos)
                }}
                styles={customStyles}
                />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div key={video.jobId}>
                   <button className="mr-2" title="Settings"  onClick={() => openModal(video.jobId)}>
                    <BsGearFill className="text-3xl text-gray-500 hover:text-teal-500 transform hover:scale-110 transition transition-colors duration-300" />
                  </button>
              </div>
              <button title="Delete" onClick={() => handleRemoveVideo(index)}>
                <MdDelete className="text-2xl text-gray-500 hover:text-red-600 transform hover:scale-110 transition transition-colors duration-300" />
              </button>
            </div>
          </li>
          ))}
        </ul>
        <div className="flex justify-between items-center mt-8">
          <span className="text-gray-600 text-lg">{uploadedVideos.length} videos uploaded</span>
          {!emailVerified && (<p className='text-center text-gray-500 mt-auto text-xs'>*Limit 5 conversions/day</p>)}
          <button className="bg-teal-800 hover:bg-teal-600 text-white font-bold py-2 px-8"
            onClick={handleConvertVideos}>
            Convert
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default UploadVideo;
