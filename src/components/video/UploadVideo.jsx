import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { FaFileCirclePlus } from "react-icons/fa6";
import { IoIosArrowDropdownCircle } from 'react-icons/io';
import { BsGearFill } from 'react-icons/bs';
import { MdDelete } from "react-icons/md";

import useDrivePicker from 'react-google-drive-picker';

import { clientId, developerKey, azureClientId } from '../../config/key';
import UploadOptions from './UploadOptions';

const UploadVideo = ({defaultFormat}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [openPicker, authResponse] = useDrivePicker();
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(true);
  const [formats, setFormats] = useState([]);

  useEffect(() => {
    fetch('/conversions.json')
      .then(response => response.json())
      .then(data => setFormats(data))
      .catch(error => console.error('Error fetching conversions:', error));
  }, []);

  const defaultOption = formats.find((format) => format.format.toLowerCase() === defaultFormat.toLowerCase());
  
  useEffect(() => {
    setShowUploadForm(uploadedVideos.length === 0);
  }, [uploadedVideos]);

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
        file: files[i],
        name: files[i].name,
        size: (files[i].size / (1024 * 1024)).toFixed(2), 
        format: defaultFormat,
      });
    }
    setUploadedVideos(newVideos);
    setShowUploadForm(false);
  };

  const onSuccess = (files) => {
    const newVideos = [...uploadedVideos];
    for (let i = 0; i < files.length; i++) {
      newVideos.push({
        file: files[i],
        name: files[i].name,
        size: (files[i].bytes / (1024 * 1024)).toFixed(2),
        format: defaultFormat,
      });
    }
    setUploadedVideos(newVideos);
    setShowUploadForm(false);
  };

  const onCancel = () => {
    console.log('Cancelled');
  };

  const handleGoogleDriveUpload = async (googleDriveFile) => {
    try {
       // Fetch the embed URL HTML content
      const response = await fetch(googleDriveFile.link);
      const blob = await response.blob();

       // Create a new File object
      const file = new File([blob], googleDriveFile.name, { type: blob.type });
  
      // Add the file to the uploadedVideos state
      setUploadedVideos((prevUploadedVideos) => [
        ...prevUploadedVideos,
        {
          name: googleDriveFile.name,
          size: (googleDriveFile.sizeBytes / (1024 * 1024)).toFixed(2), 
          format: defaultFormat,
          file: file,
        },
      ]);
      console.log(uploadedVideos)
    } catch (error) {
      console.error('Error uploading file from Google Drive:', error);
    }
  };  

  const handleOpenPicker = () => {
    openPicker({
      clientId: clientId,
      developerKey: developerKey,
      viewId: 'DOCS',
      supportDrives: true,
      multiselect: true,
      mimeTypes: ['video/*'],
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button');
        } else if(data.docs) {
          const selectedVideos = data.docs.filter(doc => doc.mimeType.startsWith('video/'));
          // console.log('Selected videos:', selectedVideos);
          selectedVideos.forEach((video) => {
            handleGoogleDriveUpload(video);
            console.log(video)
          });
          // const newVideos = [...uploadedVideos];
          // for (let i = 0; i < selectedVideos.length; i++) {
          //   newVideos.push({
          //     file: selectedVideos[i],
          //     name: selectedVideos[i].name,
          //     size: (selectedVideos[i].sizeBytes / (1024 * 1024)).toFixed(2), 
          //     format: defaultFormat,
          //   });
          // }
          // setUploadedVideos(newVideos);
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

      const formData = new FormData();
      formData.append('video', video.file);
      console.log(video.file)
      formData.append('videoName', fileNameWithoutExtension);
      formData.append('videoSize', video.size);
      formData.append('videoFormat', video.format);
  
      axios.post('http://localhost:8000/convert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then((response) => {
        console.log('Conversion started:', response);
      })
      .catch((error) => {
        console.error('Error converting video:', error);
      });
  });
  };
  
 
  return (
    <div className="container mx-auto py-8">
      {showUploadForm ? (
        <div className="flex items-center justify-center w-2/3 h-64 mx-auto bg-teal-50 p-8 rounded-lg border-dashed border-4 border-teal-400">
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
                <span className="text-gray-500 text-lg ml-2">{video.size} MB</span>
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
              <button className="mr-2" title="Settings" onClick={() => console.log('Settings clicked')}>
                <BsGearFill className="text-3xl text-gray-500" />
              </button>
              <button title="Delete" onClick={() => handleRemoveVideo(index)}>
                <MdDelete className="text-2xl text-gray-500 hover:text-red-600 transform hover:scale-110 transition transition-colors duration-300" />
              </button>
            </div>
          </li>
          ))}
        </ul>
        <div className="flex justify-between items-center mt-8">
          <span className="text-gray-600 text-lg">{uploadedVideos.length} videos uploaded</span>
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
