import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Link, useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { getAuth } from 'firebase/auth';
import { handleOpenPicker, onCancel, onSuccess, handleFileUpload } from '../../utils/uploadFiles';
import { handleConvertImages, defaultSettings } from '../../utils/images';

import { FaFileImage } from 'react-icons/fa';
import { IoIosArrowDropdownCircle } from 'react-icons/io';
import { BsGearFill } from 'react-icons/bs';
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";

import { clientId, developerKey, azureClientId } from '../../config/key';
import UploadOptions from '../video/UploadOptions';
import { useData } from '../../DataContext';


const BASE_URL = process.env.REACT_APP_BASE_URL
const socket = io(`${BASE_URL}`);

const UploadImage = ({ defaultFormat }) => {
  const navigate = useNavigate();
  const { format: currentFormat } = useParams();
  const { uploadedImages, setUploadedImages, setDownloadPageActive, setDisplayType, oversizedFiles, setOversizedFiles } = useData();
  const { showSignUpOptions, setShowSignUpOptions, emailVerified } = useData();
  const [isLoading, setIsLoading] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [formats, setFormats] = useState([]);
  const [previousFormat, setPreviousFormat] = useState(null);
  const [currentImageId, setCurrentImageId] = useState(null);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(true);
  const { idToken, showErrorMessages, setShowErrorMessages } = useData();

  const auth = getAuth();
  const user = auth.currentUser;

  // console.log(uploadedImages)

  useEffect(() => {
    fetch('/conversions.json')
      .then((response) => response.json())
      .then((data) => setFormats(data.images))
      .catch((error) => console.error('Error fetching conversions:', error));
  }, []);

  useEffect(() => {
    setShowUploadForm(uploadedImages.length === 0);
  }, [uploadedImages]);

  useEffect(() => {
    if (currentFormat !== previousFormat) {
      setPreviousFormat(currentFormat);
      setUploadedImages([]);
      }

}, [setUploadedImages, currentFormat, previousFormat]);


  useEffect(() => {
    socket.on('limitExceeded', (data) => {
      setLimitExceeded(true);
      setLimitMessage(data.message);
      setFadeOut(false);
    });

    // Cleanup on component unmount
    return () => {
      socket.off('limitExceeded');
    };
  }, []);

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

  const handleRemoveImage = (index) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: 50,
    }),
  };

//   const updateImageSettings = (imageId, newSettings) => {
//     setUploadedImages((prevImages) =>
//       prevImages.map((image) =>
//         image.jobId === imageId ? { ...image, settings: newSettings } : image
//       )
//     );
//   };

//   const resetImageSettings = (imageId) => {
//     const defaultSetting = { ...defaultSettings };
//     setUploadedImages((prevImages) =>
//       prevImages.map((image) =>
//         image.jobId === imageId ? { ...image, settings: defaultSetting } : image
//       )
//     );
//   };

  const openModal = (imageId) => {
    setCurrentImageId(imageId);
  };

  const closeModal = () => {
    setCurrentImageId(null);
  };

  const toggleSignUpOptions = () => {
    setShowSignUpOptions(!showSignUpOptions);
  };

  return (
    <div className="container w-full mx-auto py-8">
      {limitExceeded && (
        <div className={`fixed top-24 right-5 bg-red-500 z-20 text-white text-sm md:text-lg p-2 md:p-4 rounded-lg shadow-lg transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          {limitMessage}
        </div>
      )}
      {showErrorMessages && oversizedFiles.length > 0 && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-sm md:text-lg p-2 md:p-4 text-white rounded-md shadow-lg z-50 ${!showErrorMessages ? 'opacity-0 transition-opacity duration-500' : 'opacity-100'}`}>
          {oversizedFiles.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
      )}
  
      {showUploadForm ? (
        <div className="flex flex-col items-center justify-center w-3/4 sm:w-2/3 h-48 md:h-64 mx-auto bg-teal-50 p-8 rounded-lg border-dashed border-4 border-teal-400">
          <div
            className="relative w-full uploadimage uploadimages sm:w-3/5 md-custom:w-3/5 lg:w-2/5 h-1/2 bg-teal-500 rounded-lg shadow-lg flex items-center justify-between px-6"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <FaFileImage className="text-white hidden sm:block md:text-2xl lg:text-4xl cursor-pointer" />
            <span className="uploaded text-white text-center text-sm sm:text-lg lg:text-xl xl:text-2xl ml-4 lg:ml-0 pr-2 font-semibold cursor-pointer">Choose Files</span>
            <div className="h-20 w-0.5 md:block hidden bg-teal-400"></div>
            <IoIosArrowDropdownCircle className="text-white hidden sm:block md:text-2xl lg:text-4xl cursor-pointer" />
            {showDropdown && (
              <UploadOptions
                handleFileUpload={handleFileUpload}
                handleOpenPicker={handleOpenPicker}
                onSuccess={onSuccess}
                onCancel={onCancel}
                uploadedFiles={uploadedImages}
                setUploadedFiles={setUploadedImages}
                emailVerified={emailVerified}
                setOversizedFiles={setOversizedFiles}
                setShowErrorMessages={setShowErrorMessages}
                setShowUploadForm={setShowUploadForm}
                developerKey={developerKey}
                defaultFormat={defaultFormat}
                defaultSettings={defaultSettings}
                mimeType="image/*"
                editImage={false}
              />
            )}
          </div>
          {!emailVerified && (
            <p className="text-center text-xs md:text-base text-gray-500">
              Max file size 1GB. <button className='underline underline-offset-2' onClick={toggleSignUpOptions}>Sign up</button> for more
            </p>
          )}
          {!emailVerified && (<p className='text-center text-gray-500 mt-auto text-xs'>*Limit 5 conversions/day</p>)}
        </div>
      ) : (
        <div className="w-11/12 md:w-5/6 lg:2/3 m-4 md:m-auto bg-white p-8 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4">
            <span className="uploaded uploads text-teal-800 mb-4 md:mb-0 text-sm sm:text-lg lg:text-2xl xl:text-3xl font-semibold">Uploaded Images</span>
            <div
              className="addMoreFiles uploadimages relative w-3/5 lg:w-3/6 xl:w-2/5 h-1/2 bg-teal-500 rounded-lg shadow-lg z-10 flex items-center justify-between px-6"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <FaFileImage className="text-white hidden sm:block sm:text-xl md:text-2xl lg:text-4xl" />
              <span className="uploaded uploads text-white text-center text-sm py-4 md:py-0 sm:text-lg lg:text-2xl ml-4 lg:ml-0 font-semibold cursor-pointer">Add More Files</span>
              <div className="h-20 w-0.5 md:block hidden bg-teal-400"></div>
              <IoIosArrowDropdownCircle className="text-white hidden sm:block sm:text-xl md:text-2xl lg:text-4xl cursor-pointer" />
              {showDropdown && (
                <UploadOptions
                  handleFileUpload={handleFileUpload}
                  handleOpenPicker={handleOpenPicker}
                  onSuccess={onSuccess}
                  onCancel={onCancel}
                  uploadedFiles={uploadedImages}
                  setUploadedFiles={setUploadedImages}
                  emailVerified={emailVerified}
                  setOversizedFiles={setOversizedFiles}
                  setShowErrorMessages={setShowErrorMessages}
                  setShowUploadForm={setShowUploadForm}
                  developerKey={developerKey}
                  defaultFormat={defaultFormat}
                  defaultSettings={defaultSettings}
                  mimeType="image/*"
                  editImage={false}
                />
              )}
            </div>
          </div>
          <ul>
            {uploadedImages.length > 0 && (
              uploadedImages.map((image, index) => (
                <li key={index} className="flex flex-col gap-4 sm:gap-0 sm:flex-row justify-between items-center m-px border w-full py-4 px-4 border-gray-300">
                  <div className='flex flex-col gap-4 sm:gap-0 sm:flex-row w-full sm:w-5/6'>
                    <div className='flex flex-col w-full items-center sm:items-start justify-center sm:justify-start sm:w-2/3'>
                      <span className="text-teal-800 text-sm md:text-base lg:text-xl font-semibold">{image.name}</span>
                      <span className="text-gray-500 text-xs md:text-sm lg:text-lg sm:ml-2">{image.size}</span>
                    </div>
                    <div className='flex items-center text-sm lg:text-lg justify-center sm:justify-end w-full sm:w-1/3 mt-2 sm:mt-0'>
                      <p className='text-xs md:text-sm lg:text-lg pr-2 text-gray-500'>Output:</p>
                      <Select
                        options={formats.map((format) => ({ label: format.format, value: format.format.toLowerCase() }))}
                        defaultValue={{ label: defaultOption.format, value: defaultOption.format }}
                        onChange={(selectedOption) => {
                          const newImages = [...uploadedImages];
                          newImages[index].format = selectedOption.value;
                          setUploadedImages(newImages);
                        }}
                        styles={customStyles}
                      />
                    </div>
                  </div>
                  <div className='flex items-center justify-between gap-2 mt-2 sm:mt-0'>
                    <div key={image.jobId}>
                      <button className="mr-2" title="Settings" onClick={() => openModal(image.jobId)}>
                        <BsGearFill className=" text-2xl md:text-xl lg:text-3xl text-gray-500 hover:text-teal-500 transform hover:scale-110 transition transition-colors duration-300" />
                      </button>
                    </div>
                    <button title="Delete" onClick={() => handleRemoveImage(index)}>
                      <MdDelete className="text-xl md:text-xl lg:text-2xl text-gray-500 hover:text-red-600 transform hover:scale-110 transition transition-colors duration-300" />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="flex justify-between items-center mt-8">
            <span className="text-gray-600 text-xs md:text-sm lg:text-lg">{uploadedImages.length} images uploaded</span>
            {!emailVerified && (<p className='text-center text-gray-500 mt-auto text-xs'>*Limit 5 conversions/day</p>)}
            <div className='flex gap-4'>
                <Link to={`/edit-images/${defaultFormat.toLowerCase()}`} className="flex items-center justify-center bg-orange-800 hover:bg-orange-600 text-white text-xs md:text-sm lg:text-lg font-bold py-2 px-4 lg:px-8">
                  <FaEdit className="mr-2" /> Edit and Convert
                </Link>
                <button className={`bg-teal-800 ${isLoading ? 'bg-teal-600 cursor-not-allowed' : 'hover:bg-teal-600'} text-white text-xs md:text-sm lg:text-lg font-bold py-2 px-4 lg:px-8`}
                onClick={() => handleConvertImages(uploadedImages, user, emailVerified, idToken, navigate, setDisplayType ,setDownloadPageActive, setIsLoading)}
                disabled={isLoading}>
                  {isLoading ? <CgSpinner className="animate-spin mr-2 size-6" /> : 'Convert'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadImage;
