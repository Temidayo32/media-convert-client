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

import { Tooltip, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { GiEmptyMetalBucketHandle, GiHistogram  } from "react-icons/gi";
import { FaArrowRight } from 'react-icons/fa';
import { CgSpinner } from "react-icons/cg";
import { CiBrightnessUp, CiSquareInfo } from "react-icons/ci";
import { MdBlurOn, MdOutlineCropRotate } from "react-icons/md";
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
  histogramEqualization: <GiHistogram />,
  colorManipulation: <IoMdContrast />,
};


const EditImage = ({ defaultFormat }) => {
  const navigate = useNavigate();
  const { format: currentFormat } = useParams();
  const { idToken, uploadedImages, setUploadedImages, emailVerified, setDownloadPageActive, setDisplayType, oversizedFiles, setOversizedFiles, showErrorMessages, setShowErrorMessages, showUploadForm, setShowUploadForm } = useData();
  const [selectedImageId, setSelectedImageId] = useState(uploadedImages.length ? uploadedImages[0].jobId : null);
  const image = selectedImageId ? uploadedImages.find(img => img.jobId === selectedImageId) : null;
  const [imageSettings, setImageSettings] = useState(image ? image.settings : defaultSettings);
  const [currentImageSettings, setCurrentImageSettings] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formats, setFormats] = useState([]);
  const canvasRef = useRef(null);
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
    console.log(uploadedImages)
  }, [uploadedImages, setShowUploadForm]);
  

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
  }, [image, canvasRef, setUploadedImages, uploadedImages]);

  
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
          }, (result) => {

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
                // console.log(result)
                setIsLoading(false); 
                ctx.putImageData(result.processedImageData, x, y);
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
    setUploadedImages(prevImages =>
      prevImages.map(img =>
        img.jobId === imageId ? { ...img, settings: newSettings } : img
      )
    );
  };
  
  const handleImageSettingsChange = (newSettings) => {
    setCurrentImageSettings(newSettings);
    if (selectedImageId && uploadedImages) {
      updateImageSettings(selectedImageId, newSettings);
    }
  };

  // const applySettings = (canvas) => {
  //   const ctx = canvas.getContext('2d', { willReadFrequently: true });
  //   let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  //   let mat = cv.matFromImageData(imgData);

  //   try {
  //       // Apply Brightness and Contrast
  //       if (imageSettings.brightness.alpha !== 1.0 || imageSettings.brightness.beta !== 0) {
  //           const { alpha, beta } = imageSettings.brightness;
  //           mat.convertTo(mat, -1, alpha, beta); // Adjust brightness and contrast
  //       }

  //       // Apply Blur
  //       if (imageSettings.blur.type !== 'None') {
  //           const { type, kernel_size } = imageSettings.blur;
  //           console.log('Applying blur:', type, kernel_size);
  //           let blurredMat = new cv.Mat();

  //           switch (type) {
  //               case 'Gaussian':
  //                   cv.GaussianBlur(mat, blurredMat, new cv.Size(kernel_size, kernel_size), 0, 0, cv.BORDER_DEFAULT);
  //                   break;
  //               case 'Median':
  //                   if (kernel_size % 2 === 0) throw new Error('Kernel size for median blur must be odd');
  //                   cv.medianBlur(mat, blurredMat, kernel_size);
  //                   break;
  //               case 'Bilateral':
  //                   cv.bilateralFilter(mat, blurredMat, kernel_size, kernel_size * 2, kernel_size / 2, cv.BORDER_DEFAULT);
  //                   break;
  //               default:
  //                   blurredMat = mat.clone(); // Fall back to original if invalid type
  //                   break;
  //           }

  //           mat.delete();
  //           mat = blurredMat;
  //       }

  //       // Resize Image
  //       if (imageSettings.resize.width && imageSettings.resize.height) {
  //           const { width, height } = imageSettings.resize;
  //           let resizedMat = new cv.Mat();
  //           cv.resize(mat, resizedMat, new cv.Size(width, height), 0, 0, cv.INTER_AREA);
  //           mat.delete();
  //           mat = resizedMat;
  //       }

  //       // Apply Rotate
  //       if (imageSettings.rotate.angle !== 0) {
  //           const { angle } = imageSettings.rotate;
  //           console.log('Applying rotation:', angle);

  //           let center = new cv.Point(mat.cols / 2, mat.rows / 2);
  //           let M = cv.getRotationMatrix2D(center, angle, 1);

  //           // Calculate new bounding box size
  //           let cos = Math.abs(M.doubleAt(0, 0));
  //           let sin = Math.abs(M.doubleAt(0, 1));
  //           let newWidth = Math.floor(mat.rows * sin + mat.cols * cos);
  //           let newHeight = Math.floor(mat.rows * cos + mat.cols * sin);

  //           // Adjust rotation matrix to account for translation
  //           M.doublePtr(0, 2)[0] += (newWidth / 2) - center.x;
  //           M.doublePtr(1, 2)[0] += (newHeight / 2) - center.y;

  //           let rotatedMat = new cv.Mat();
  //           cv.warpAffine(mat, rotatedMat, M, new cv.Size(newWidth, newHeight), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

  //           mat.delete();
  //           mat = rotatedMat;
  //       }

  //       // Flip Image
  //       if (imageSettings.flip.horizontal || imageSettings.flip.vertical) {
  //           let flippedMat = new cv.Mat();
  //           let flipCode = imageSettings.flip.horizontal && imageSettings.flip.vertical ? -1 : imageSettings.flip.horizontal ? 1 : 0;
  //           cv.flip(mat, flippedMat, flipCode);
  //           mat.delete();
  //           mat = flippedMat;
  //       }

  //      // Convert to Gray for Edge Detection or Histogram Equalization if necessary
  //         if (imageSettings.edgeDetection.method !== 'None' || imageSettings.histogramEqualization.enabled) {
  //           let grayMat = new cv.Mat();
  //           cv.cvtColor(mat, grayMat, cv.COLOR_RGBA2GRAY, 0);
  //           mat.delete();
  //           mat = grayMat;
  //         }

  //         // Perform Edge Detection
  //         if (imageSettings.edgeDetection.method === 'Canny') {
  //           let edges = new cv.Mat();
  //           cv.Canny(mat, edges, imageSettings.edgeDetection.threshold1, imageSettings.edgeDetection.threshold2, 3, false);
  //           mat.delete();
  //           mat = edges;
  //         } else if (imageSettings.edgeDetection.method === 'Sobel') {
  //           let gradX = new cv.Mat();
  //           let gradY = new cv.Mat();
  //           let absGradX = new cv.Mat();
  //           let absGradY = new cv.Mat();
  //           let edges = new cv.Mat();
  //           cv.Sobel(mat, gradX, cv.CV_16S, 1, 0);
  //           cv.convertScaleAbs(gradX, absGradX);
  //           cv.Sobel(mat, gradY, cv.CV_16S, 0, 1);
  //           cv.convertScaleAbs(gradY, absGradY);
  //           cv.addWeighted(absGradX, 0.5, absGradY, 0.5, 0, edges);
  //           mat.delete();
  //           gradX.delete();
  //           gradY.delete();
  //           absGradX.delete();
  //           absGradY.delete();
  //           mat = edges;
  //         }

  //         // Apply Histogram Equalization
  //         if (imageSettings.histogramEqualization.enabled) {
  //           let equalizedMat = new cv.Mat();
  //           cv.equalizeHist(mat, equalizedMat);
  //           mat.delete();
  //           mat = equalizedMat;
  //         }


  //       // Convert Color Space
  //       if (imageSettings.colorSpace.conversion !== 'None') {
  //           let convertedMat = new cv.Mat();
  //           switch (imageSettings.colorSpace.conversion) {
  //               case 'GRAY':
  //                   cv.cvtColor(mat, convertedMat, cv.COLOR_RGBA2GRAY, 0);
  //                   break;
  //               case 'HSV':
  //                   cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2HSV, 0);
  //                   break;
  //               case 'HLS':
  //                   cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2HLS);
  //                   break;
  //               case 'LAB':
  //                   cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2Lab, 0);
  //                   break;
  //               case 'BGR':
  //                   cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2BGR);
  //                   break;
  //               case 'Luv':
  //                   cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2Luv, 0);
  //                   break;
  //               case 'YCrCb':
  //                   cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2YCrCb);
  //                   break;
  //               case 'YUV':
  //                   cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2YUV);
  //                   break;
  //               case 'XYZ':
  //                   cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2XYZ);
  //                   break;
  //               // Add other color space conversions as needed
  //               default:
  //                   convertedMat = mat.clone(); // No conversion needed
  //                   break;
  //           }
  //           mat.delete(); // Clean up original Mat
  //           mat = convertedMat; // Update mat to the converted Mat
  //       }


  //       // Apply Color Manipulation (Saturation, Hue, Contrast)
  //       const { saturation, hue, contrast } = imageSettings.colorManipulation;
  //       if (saturation !== 1.0 || hue !== 0 || contrast !== 1.0) {
  //           mat.convertTo(mat, -1, contrast, 0);
  //           cv.cvtColor(mat, mat, cv.COLOR_RGB2HSV);
  //           for (let i = 0; i < mat.rows; i++) {
  //               for (let j = 0; j < mat.cols; j++) {
  //                   let pixel = mat.ucharPtr(i, j);
  //                   pixel[1] = Math.max(0, Math.min(pixel[1] * saturation, 255));
  //                   pixel[0] = (pixel[0] + hue) % 180;
  //               }
  //           }
  //           cv.cvtColor(mat, mat, cv.COLOR_HSV2RGB);
  //       }

  //       // Display the processed image on canvas
  //       cv.imshow(canvas, mat);

  //   } catch (error) {
  //       console.error("Error applying settings:", error);
  //   } finally {
  //       // Clean up resources
  //       mat.delete();
  //   }
  // }

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
            <div className="absolute w-72 left-24 top-64 transform -translate-y-1/2 px-8 py-4 bg-gray-800 shadow-2xl rounded-lg z-20">
              <h4 className="text-md font-bold mb-4 capitalize text-white">{formatCategoryName(activeCategory)}</h4>
              {imageSettingsConfig.find(category => category.category === activeCategory)?.settings.map(setting => (
                <div key={setting.key} className="mb-4">
                  {
                    renderSettingControl(activeCategory, setting, imageSettings, handleSettingChange, handleFlip, handleRotateClick)
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      
        {/* Image Display Section */}
        <div className="w-full h-full p-4 bg-gray-200">
          <div className="relative ml-16 p-4 w-11/12 h-4/6 overflow-y-auto flex items-center justify-center mt-28">
          {image ? (

                <canvas
                  ref={canvasRef}
                  className="max-h-full mx-auto"
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
            onClick={() => handleConvertImages(uploadedImages, user, emailVerified, idToken, navigate, setDisplayType, setDownloadPageActive)}
          >
            Convert <FaArrowRight className="ml-4"/>
          </button>
      </div>

      {/* <aside className={`relative z-40 sm:z-auto top-0 right-0 sm:top-auto sm:right-auto transform ${actionsCollapsed ? 'w-1/4 translate-x-full sm:translate-x-0' : 'hidden translate-x-0'} transition-transform duration-300 h-screen bg-orange-100 shadow-lg text-gray-700`}>
        <nav className="flex flex-col p-2 sm:p-4 space-y-8 h-full mt-4">
          <CgPushRight onClick={() => setActionsCollapsed(!actionsCollapsed)} className='text-lg sm:text-xl md:text-2xl' />
          {actionsCollapsed && (
            <div className="flex flex-col items-center h-full">
              Upload Options
              <div
                className="relative w-4/5 z-20 text-center bg-teal-500 rounded-lg shadow-lg flex items-center justify-between px-6"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <span className="text-white text-xs md:text-sm lg:text-base font-bold py-4 px-2">Add More Photos</span>
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

              Format Selection Dropdowns
              {image && (
                <div className='flex items-center mt-8'>
                  <p className='text-xs md:text-sm lg:text-base pr-2 text-gray-500'>Output Format:</p>
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
              
              Push the button to the bottom
              <div className="flex-grow"></div>

              Convert Button
              <button
                className="bg-teal-500 flex justify-center items-center hover:bg-teal-600 text-white text-xs md:text-sm lg:text-lg font-bold py-4 px-4 lg:px-8 mt-4"
                onClick={() => handleConvertImages(uploadedImages, user, emailVerified, idToken, navigate, setDisplayType, setDownloadPageActive)}
              >
                Convert <FaArrowRight className="ml-4"/>
              </button>
            </div>
          )}
        </nav>
      </aside> */}
      </div>
    </div>
  );
};

export default EditImage;

