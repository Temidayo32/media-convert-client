import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useOpenCv } from "opencv-react";

import { WorkerPool } from '../../utils/WorkerPool';
import { InvalidKernelSizeError, InvalidColorSpaceError, UnsupportedImageFormatError } from '../../utils/error';

import { useData } from '../../DataContext';
import { imageSettingsConfig, defaultSettings } from '../../utils/images';
import ImageThumbnails from './ImageThumbnails';
import { handleOpenPicker, onCancel, onSuccess, handleFileUpload } from '../../utils/uploadFiles';
import { handleConvertImages } from '../../utils/images';
import { developerKey } from '../../config/key';
import UploadOptions from '../video/UploadOptions';
import { renderSettingControl } from '../../composables/imageSettings';
import CropImage from './CropImage';

import { Tooltip, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { GiEmptyMetalBucketHandle, GiHistogram  } from "react-icons/gi";
import { FaArrowRight } from 'react-icons/fa';
import { CgSpinner, CgUndo, CgRedo } from "react-icons/cg";
import { CiBrightnessUp, CiSquareInfo } from "react-icons/ci";
import { MdBlurOn, MdOutlineCropRotate, MdCropFree } from "react-icons/md";
import { IoResizeOutline } from "react-icons/io5";
import { LuFlipVertical2 } from "react-icons/lu";
import { PiDetectiveFill } from "react-icons/pi";
import { IoIosColorFilter, IoMdContrast } from "react-icons/io";


const categoryIcons = {
  brightness: <CiBrightnessUp />,
  blur: <MdBlurOn />,
  resize: <IoResizeOutline />,
  rotate: <MdOutlineCropRotate />,
  flip: <LuFlipVertical2 />,
  edgeDetection: <PiDetectiveFill />,
  colorSpace: <IoIosColorFilter />,
  crop: <MdCropFree />,
  histogramEqualization: <GiHistogram />,
  colorManipulation: <IoMdContrast />,
};


const EditImage = ({ defaultFormat }) => {
  const navigate = useNavigate();
  const { idToken, uploadedImages, setUploadedImages, emailVerified, setDownloadPageActive, setDisplayType, oversizedFiles, setOversizedFiles, showErrorMessages, setShowErrorMessages, showUploadForm, setShowUploadForm } = useData();
  const [selectedImageId, setSelectedImageId] = useState(uploadedImages.length ? uploadedImages[0].jobId : null);
  const image = selectedImageId ? uploadedImages.find(img => img.jobId === selectedImageId) : null;
  const [imageSettings, setImageSettings] = useState(image ? image.settings : defaultSettings);
  const [imageHistories, setImageHistories] = useState({});
  const [currentSteps, setCurrentSteps] = useState({});
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [triggerCrop, setTriggerCrop] = useState(false);
  const [applyCrop, setApplyCrop] = useState(false);
  const [currentBlob, setCurrentBlob] = useState(null);
  const [updateComplete, setUpdateComplete] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [currentImageSettings, setCurrentImageSettings] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formats, setFormats] = useState([]);
  const canvasRef = useRef(null);
  const prevBlobRef = useRef(null);
  // const { cv, loaded: cvLoaded } = useOpenCv();
  const [activeCategory, setActiveCategory] = useState(null);
  const [ isLoading, setIsLoading ] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCategoryClick = (category) => {
    setActiveCategory(category === activeCategory ? null : category);
  };


  const auth = getAuth();
  const user = auth.currentUser
  

  const workerPool = new WorkerPool(2); // Create a pool of 2 workers


  useEffect(() => {
    fetch('/conversions.json')
      .then((response) => response.json())
      .then((data) => setFormats(data.images))
      .catch((error) => console.error('Error fetching conversions:', error));
  }, []);

  useEffect(() => {
    setShowUploadForm(uploadedImages.length === 0);
    // console.log(uploadedImages)
  }, [uploadedImages, setShowUploadForm]);

  useEffect(() => {
    if (!imageHistories[selectedImageId]) {
      setImageHistories({
        ...imageHistories,
        [selectedImageId]: [imageSettings],
      });
      setCurrentSteps({
        ...currentSteps,
        [selectedImageId]: 0,
      });
    }
  }, [selectedImageId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z') {
          event.preventDefault();
          undo();
        } else if (event.key === 'y') {
          event.preventDefault();
          redo();
        }
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageId, currentSteps, imageHistories]);
  

  useEffect(() => {
    const loadImage = async () => {
      if (!image || !canvasRef.current) return;
      
      const supportedFormats = ['jpeg', 'jpg', 'png', 'bmp', 'svg'];
      const fileFormat = image.name.split('.').pop().toLowerCase();
      
      if (!supportedFormats.includes(fileFormat)) {
        setUploadedImages(uploadedImages.filter(img => img !== image));
        throw new UnsupportedImageFormatError('Unsupported image format. Supported formats are: jpeg, jpg, png, bmp, svg.');
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      let objectUrl = null;

      try {
        if (image.source === 'local') {
          objectUrl = URL.createObjectURL(image.file);
          img.src = objectUrl;
        } else if (image.source === 'dropbox') {
          const response = await fetch(image.fileLink.replace('dl=0', 'raw=1'), { mode: 'cors' });

          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }

          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          img.src = objectUrl;
        }

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          applySettings(canvas);

          const dataUrl = canvas.toDataURL();
          setImageDataUrl(dataUrl);

          canvas.toBlob((blob) => {
            if(blob) {
              console.log(blob)
            }
          })
        };
      } catch (error) {
        console.error('Error loading image:', error);
        setErrorMessage(error.message);
      }

      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    };

    loadImage().catch((error) => {
      if (error instanceof UnsupportedImageFormatError) {
        setShowErrorMessages(true)
        setErrorMessage(error.message);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    });

    // Clean up workers when the component unmounts
    return () => {
      workerPool.terminateWorkers();
    };
  }, [image, canvasRef, imageSettings, selectedPreset]);

  useEffect(() => {
    if (updateComplete) {
      handleConvertImages(uploadedImages, user, emailVerified, idToken, navigate, setDisplayType, setDownloadPageActive);
      setUpdateComplete(false);  // Reset the flag
    }
  }, [updateComplete, uploadedImages, user, emailVerified, idToken, navigate, setDisplayType, setDownloadPageActive]);

  const updateImageInState = (jobId, blob) => {
    return new Promise((resolve) => {
      setUploadedImages(prevImages => {
        const updatedImages = prevImages.map(img =>
          img.jobId === jobId ? { ...img, file: blob } : img
        );
        resolve(updatedImages);  // Resolve with the updated images
        return updatedImages;
      });
    });
  };

  const handleButtonClick = () => {
    updateImageInState(image.jobId, currentBlob).then((updatedImages) => {
      setUploadedImages(updatedImages);  // Ensure state is updated with the latest images
      setUpdateComplete(true);  // Trigger the effect to call handleConvertImages
    });
  };

  function imageDataToBlob(imageData) {
    return new Promise((resolve, reject) => {
      try {
        const offscreenCanvas = new OffscreenCanvas(imageData.width, imageData.height);
        const offscreenCtx = offscreenCanvas.getContext('2d');
  
        offscreenCtx.putImageData(imageData, 0, 0);
  
        offscreenCanvas.convertToBlob().then((blob) => {
          if (blob) {
            console.log(blob)
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob.'));
          }
        }).catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  const handleCropComplete = async (croppedArea, croppedAreaPixels) => {
    if (applyCrop && croppedAreaPixels) {
      try {
        setSelectedPreset(null);

        const updatedSettings = {
          ...imageSettings,
          crop: {
            x: croppedAreaPixels.x,
            y: croppedAreaPixels.y,
            width: croppedAreaPixels.width,
            height: croppedAreaPixels.height
          }
        };

        setImageSettings(updatedSettings);
        handleImageSettingsChange(updatedSettings);
        setApplyCrop(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleApplyCrop = () => {
    setApplyCrop(true);
    setTriggerCrop(true);
  };
  
  const handleFormatChange = (event) => {
    const newFormat = event.target.value;
    const newImages = uploadedImages.map(img => 
      img.jobId === selectedImageId ? { ...img, format: newFormat } : img
    );
    setUploadedImages(newImages);
  };

  const formatCategoryName = (name) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const applySettings = (canvas) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    setIsLoading(true);
  
    try {
        // Get image data from the canvas
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Example validation checks
        if (imageSettings.blur) {
          const { kernel_size } = imageSettings.blur;
          console.log(kernel_size)
          if (kernel_size % 2 === 0) {
            throw new InvalidKernelSizeError('Kernel size for blur must be an odd number.');
          }
        }

        if (imageSettings.edgeDetection.method !== "None" || imageSettings.histogramEqualization.enabled) {
          if (imageSettings.colorSpace.conversion !== "None") {
              throw new InvalidColorSpaceError('Histogram equalization or edge detection requires the image to be in RGBA color space.');
          }
      }

        // Pass image data to worker pool for processing
        workerPool.processImage(
          { imageData: imgData, 
            imageSettings, 
            canvasWidth: canvas.width,
            canvasHeight: canvas.height, 
          }, 
          async (result) => {

            try {

                if (result.error) {
                  console.error("Error processing:", result.error);
                  return;
                }

                // Clear the canvas before drawing the processed image
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Ensure result.processedImageData exists
                if (!result.processedImageData) {
                  throw new Error("Processed image data is undefined");
                }

                // Calculate the position to center the image
                const x = (canvas.width - result.processedImageData.width) / 2;
                const y = (canvas.height - result.processedImageData.height) / 2;

                // Display processed image data on the original canvas
                ctx.putImageData(result.processedImageData, x, y);
                setIsLoading(false);
                 
                const newBlob = await imageDataToBlob(result.processedImageData)
                setCurrentBlob(newBlob)
                
            } catch (callbackError) {
                console.error("Error in callback:", callbackError);
                setShowErrorMessages(true);
                setErrorMessage('An error occurred while applying filter.');
          }

        });

    } catch (error) {
      if (error instanceof InvalidKernelSizeError) {
        console.error('Invalid kernel size:', error.message);
        setShowErrorMessages(true);
        setErrorMessage(error.message);
      } else if (error instanceof InvalidColorSpaceError) {
        console.error('Invalid color space:', error.message);
        setShowErrorMessages(true);
        setErrorMessage(error.message);
      } else {
        console.error('Error in applySettings:', error);
        setShowErrorMessages(true);
        setErrorMessage('An error occurred while applying filter.');
      }
      setIsLoading(false);
    }
  };

  if (showErrorMessages) {
    setTimeout(() => {
      setShowErrorMessages(false);
    }, 5000); // 5 seconds timeout
  }

  const handleRotateClick = (angle) => {
    setImageSettings(prevSettings => ({
      ...prevSettings,
      rotate: {
        ...prevSettings.rotate,
        angle: (prevSettings.rotate.angle + angle) % 360
      }
    }));
    console.log(angle)
    handleImageSettingsChange({ ...imageSettings, rotate: { ...imageSettings.rotate, angle: (imageSettings.rotate.angle + angle) % 360 } });
  };
  
  const handleFlip = (axis) => {
    setImageSettings(prevSettings => ({
      ...prevSettings,
      flip: {
        ...prevSettings.flip,
        [axis]: !prevSettings.flip[axis]
      }
    }));
    handleImageSettingsChange({ ...imageSettings, flip: { ...imageSettings.flip, [axis]: !imageSettings.flip[axis] } });
  };
  
  const handleSettingChange = (settingCategory, setting, value) => {
    setImageSettings(prevSettings => ({
      ...prevSettings,
      [settingCategory]: {
        ...prevSettings[settingCategory],
        [setting]: value
      }
    }));
    handleImageSettingsChange(imageSettings);
  };

  const updateImageSettings = (imageId, newSettings) => {
    if (!imageId) return;

    const newHistory = (imageHistories[imageId] || []).slice(0, currentSteps[imageId] + 1);
    newHistory.push(newSettings);

    setImageHistories({
      ...imageHistories,
      [imageId]: newHistory,
    });

    setCurrentSteps({
      ...currentSteps,
      [imageId]: newHistory.length - 1,
    });

    // Update settings for the current image in uploadedImages
    const updatedImages = uploadedImages.map(img =>
      img.jobId === imageId ? { ...img, settings: newSettings } : img
    );
    setUploadedImages(updatedImages);
  };
  
  const handleImageSettingsChange = (newSettings) => {
    setCurrentImageSettings(newSettings);
    if (selectedImageId && uploadedImages) {
      updateImageSettings(selectedImageId, newSettings);
    }
  };

  const undo = () => {
    const imageId = selectedImageId;
    if (!imageId || currentSteps[imageId] <= 0) return;

    const newStep = currentSteps[imageId] - 1;
    setCurrentSteps({
      ...currentSteps,
      [imageId]: newStep,
    });
    setImageSettings(imageHistories[imageId][newStep]);
  };

  const redo = () => {
    const imageId = selectedImageId;
    if (!imageId || currentSteps[imageId] >= imageHistories[imageId].length - 1) return;

    const newStep = currentSteps[imageId] + 1;
    setCurrentSteps({
      ...currentSteps,
      [imageId]: newStep,
    });
    setImageSettings(imageHistories[imageId][newStep]);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-grow flex">
        {/* {error section} */}
        {showErrorMessages && (
          <div
            className={`fixed flex items-center bottom-24 left-1/3 transform -translate-x-1/2 bg-red-500 text-sm p-2 text-white rounded-lg shadow-lg z-50 ${
              showErrorMessages ? 'slide-up' : ''
            }`}
          >
            <CiSquareInfo className='mr-1 size-8' /> {errorMessage}
          </div>
        )}
          
        {/* Settings Section */}
        <div className="relative h-screen">
          <aside className="absolute left-6 rounded-full top-96 hover:shadow-2xl transform -translate-y-1/2 flex flex-col space-y-4 p-2 bg-gray-800 shadow-lg text-white">
              {imageSettingsConfig.map(category => (
              <Tooltip key={category.category} title={category.category} arrow placement="right">
                <div
                  className={`cursor-pointer p-2 rounded-full hover:bg-orange-200 transition ${activeCategory === category.category ? 'bg-orange-200' : ''}`}
                  onClick={() => handleCategoryClick(category.category)}
                >
                  {/* Icon representing the category, use a default icon for simplicity */}
                  {categoryIcons[category.category]}
                </div>
              </Tooltip>
            ))}
          </aside>

          {activeCategory && (
            <div className="absolute w-80 left-24 top-80 transform -translate-y-1/2 px-8 py-4 bg-gray-800 shadow-2xl rounded-lg z-20">
              <h4 className="text-md font-bold mb-4 capitalize text-white">{formatCategoryName(activeCategory)}</h4>
              {imageSettingsConfig.find(category => category.category === activeCategory)?.settings.map(setting => (
                <div key={setting.key} className="mb-4">
                  {
                    renderSettingControl(activeCategory, setting, imageSettings, selectedPreset, setSelectedPreset, handleApplyCrop, handleSettingChange, handleFlip, handleRotateClick)
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      
        {/* Image Display Section */}
        <div className="w-full h-full p-4 bg-gray-200">
          <div className="relative ml-16 p-4 w-11/12 h-4/6 overflow-y-auto flex items-center justify-center mt-28">
            { selectedPreset && 
              <CropImage
                imageDataUrl={imageDataUrl} // Replace with the actual imageDataUrl prop
                aspect={selectedPreset.width / selectedPreset.height}
                onCropComplete={handleCropComplete}
                triggerCrop={triggerCrop}
              />}
            {image ? ( 
              <canvas
                ref={canvasRef}
                className={`max-h-full mx-auto ${selectedPreset ? 'hidden' : ''}`}
              ></canvas>  
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <GiEmptyMetalBucketHandle className="size-32 sm:size-48 lg:size-60 transform rotate-45" />
                <p className="text-xs sm:text-sm lg:text-base">No image selected</p>
              </div>
            )}
            {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10">
              <CgSpinner className="animate-spin size-4 md:size-6 text-white" />
            </div>
            )}
          </div>

          {/* Image Thumbnails Section */}
          <ImageThumbnails
            uploadedImages={uploadedImages}
            selectedImageId={selectedImageId}
            setSelectedImageId={setSelectedImageId}
          />
      </div>

      {/* undo and redo button */}
      <div className="absolute top-28 left-24 w-1/12 gap-2 items-center justify-center flex bg-gray-200 shadow-lg rounded-lg cursor-pointer">
      <button 
          onClick={undo} 
          disabled={!selectedImageId || currentSteps[selectedImageId] === 0}
          className={`${!selectedImageId || currentSteps[selectedImageId] === 0 ? 'text-gray-400 cursor-not-allowed': 'text-black cursor-pointer'}`}
        >
          <CgUndo className='size-12' />
        </button>
        <div className="h-12 w-0.5 md:block hidden bg-gray-400"></div>
        <button 
          onClick={redo} 
          disabled={!selectedImageId || currentSteps[selectedImageId] >= (imageHistories[selectedImageId]?.length - 1)} 
          className={`${!selectedImageId || currentSteps[selectedImageId] >= (imageHistories[selectedImageId]?.length - 1) ? 'text-gray-400 cursor-not-allowed': 'text-black cursor-pointer'}`}
        >
          <CgRedo className='size-12' />
        </button>
      </div>

      {/* Action Section */}
      <div className="absolute top-24 right-24 w-2/5 shadow-2xl justify-between items-center rounded-lg py-2 px-4 flex">
          {/* Upload Options */}
          <div
            className="relative z-20 text-center bg-gray-800 rounded-lg flex items-center px-1"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <span className="text-white text-xs md:text-sm font-bold py-4 px-6">Add More Photos</span>
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
                editImage={true}
              />
            )}
          </div>
            
          {/* Format Selection Dropdowns */}
          {image && (
            <div className='flex items-center'>
              <p className='text-xs md:text-sm pr-2 text-gray-500'>Output Format:</p>
              <FormControl fullWidth>
                <InputLabel id="format-select-label">Format</InputLabel>
                <Select
                  labelId="format-select-label"
                  value={image.format || ''}
                  onChange={handleFormatChange}
                >
                  {formats.map(format => (
                    <MenuItem key={format.format} value={format.format.toLowerCase()}>
                      {format.format}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}
          {/* Convert Button */}
          <button
            className="bg-gray-900 flex justify-center items-center hover:bg-gray-600 text-white text-xs md:text-sm font-bold py-4 px-4"
            onClick={handleButtonClick}
          >
            Convert <FaArrowRight className="ml-4"/>
          </button>
      </div>
      </div>
    </div>
  );
};

export default EditImage;

