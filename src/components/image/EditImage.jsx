import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useOpenCv } from "opencv-react";
import { WorkerPool } from '../../utils/WorkerPool';

import { useData } from '../../DataContext';
import { imageSettingsConfig } from '../../utils/images';
import ImageThumbnails from './ImageThumbnails';
import { handleOpenPicker, onCancel, onSuccess, handleFileUpload } from '../../utils/uploadFiles';
import { handleConvertImages } from '../../utils/images';
import { developerKey } from '../../config/key';
import UploadOptions from '../video/UploadOptions';

import { Tooltip, Slider, Select, MenuItem, InputLabel, FormControl, Checkbox, FormControlLabel } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import FlipIcon from '@mui/icons-material/Flip';
import { GiEmptyMetalBucketHandle } from "react-icons/gi";
import { FaArrowRight } from 'react-icons/fa';
import { CgPushLeft,  CgPushRight } from "react-icons/cg";


const defaultSettings = {
  brightness: { alpha: 1.0, beta: 0 },
  blur: { type: 'None', kernel_size: 1 },
  resize: { width: null, height: null },
  rotate: { angle: 0 },
  crop: { x: 0, y: 0, width: null, height: null },
  edgeDetection: { method: 'None', threshold1: 0, threshold2: 0 },
  colorSpace: { conversion: 'None' },
  histogramEqualization: false,
  colorManipulation: { saturation: 1.0, hue: 0, contrast: 1.0 },
  flip: { horizontal: false, vertical: false }
};

const formatMap = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  pdf: 'application/pdf',
  svg: 'image/svg+xml',
  // Add other mappings as needed
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
  const [previousFormat, setPreviousFormat] = useState(null);
  const [settingsCollapsed, setSettingsCollapsed] = useState(true);
  const [actionsCollapsed, setActionsCollapsed] = useState(true);
  const canvasRef = useRef(null);
  // const { cv, loaded: cvLoaded } = useOpenCv();

  const auth = getAuth();
  const user = auth.currentUser
  

  const workerPool = new WorkerPool(4); // Create a pool of 4 workers


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
    let objectUrl = null;
    if (image && canvasRef.current) {
      console.log(image.format)
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      const loadImage = () => {
        if (image.source === 'local') {
          objectUrl = URL.createObjectURL(image.file);
          img.src = objectUrl;
        } else if (image.source === 'dropbox') {
          const fileLink = image.fileLink.replace('dl=0', 'raw=1');
          img.src = fileLink;
        }

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          applySettings(canvas)
        };

        return () => {
          if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
          }
        };
      };

      loadImage();

      // Clean up workers when the component unmounts
    return () => {
      workerPool.terminateWorkers();
    };
    }
  }, [image, canvasRef]);

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

  const handleFormatChange = (event) => {
    const newFormat = event.target.value;
    const newImages = uploadedImages.map(img => 
      img.jobId === selectedImageId ? { ...img, format: newFormat } : img
    );
    setUploadedImages(newImages);
  };

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

  const formatCategoryName = (name) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const applySettings = (canvas) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    try {
        // Get image data from the canvas
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Pass image data to worker pool for processing
        workerPool.processImage({ imageData: imgData, imageSettings }, (result) => {
            if (result.error) {
                console.error("Error processing:", result.error);
                return;
            }

            // Display processed image data on the original canvas
            console.log(result)
            ctx.putImageData(result.processedImageData, 0, 0);
        });
    } catch (error) {
        console.error("Error in applySettings:", error);
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
    <div className="flex h-screen relative">
      <div className="flex-grow flex">
        {/* Settings Section */}
        <aside className={`relative overflow-y-auto hide-scrollbar z-40 sm:z-auto top-0 left-0 sm:top-auto sm:left-auto transform ${settingsCollapsed ? 'w-1/3 -translate-x-full sm:-translate-x-0' : 'hidden translate-x-0'} transition-transform duration-300 h-screen bg-orange-100 shadow-lg text-gray-700`}>
          <nav className="flex flex-col p-2 sm:p-4 space-y-8">
          <CgPushLeft onClick={() => setSettingsCollapsed(!settingsCollapsed)} className='text-lg sm:text-xl md:text-2xl' />
            {settingsCollapsed && (
              imageSettingsConfig.map(category => (
                <div key={category.category} className="mb-6">
                  <h4
                    id={`category-${category.category}`}
                    className="text-md font-bold mb-2 capitalize"
                  >
                    {formatCategoryName(category.category)}
                  </h4>
                  {category.settings.map(setting => (
                    <div key={setting.key} className="mb-4" aria-labelledby={`category-${category.category}`}>
                      <Tooltip title={setting.label} arrow placement="top">
                        <div>
                          {setting.type === 'range' && (
                            <div className="flex items-center">
                              <InputLabel className="mr-2 text-xs">{setting.label}</InputLabel>
                              <Slider
                                value={imageSettings[category.category][setting.key]}
                                min={setting.min}
                                max={setting.max}
                                step={setting.step}
                                onChange={(e, newValue) =>
                                  handleSettingChange(category.category, setting.key, newValue)
                                }
                                className="flex-grow"
                              />
                            </div>
                          )}
                          {setting.type === 'select' && (
                            <FormControl fullWidth>
                              <InputLabel>{setting.label}</InputLabel>
                              <Select
                                value={imageSettings[category.category][setting.key]}
                                onChange={(e) =>
                                  handleSettingChange(category.category, setting.key, e.target.value)
                                }
                              >
                                {setting.options.map(option => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                          {setting.type === 'number' && (
                            <div className="flex items-center">
                              <InputLabel className="mr-2">{setting.label}</InputLabel>
                              <input
                                type="number"
                                value={imageSettings[category.category][setting.key]}
                                min={setting.min}
                                max={setting.max}
                                step={setting.step}
                                onChange={(e) =>
                                  handleSettingChange(category.category, setting.key, parseInt(e.target.value))
                                }
                                className="border border-gray-300 p-1 rounded w-full"
                              />
                            </div>
                          )}
                          {setting.type === 'checkbox' && (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={imageSettings[category.category][setting.key]}
                                  onChange={(e) =>
                                    handleSettingChange(category.category, setting.key, e.target.checked)
                                  }
                                />
                              }
                              label={setting.label}
                            />
                          )}
                          {setting.type === 'icon' && setting.key === 'angle' && (
                            <div className="flex items-center mr-4" key={setting.label}>
                                <div onClick={() => handleRotateClick(setting.options[1].value)} className="mr-2 flex items-center cursor-pointer">
                                  <InputLabel className="mr-2">Left</InputLabel>
                                  <RotateLeftIcon className="transform transition-transform duration-300 hover:scale-110" />
                                </div>
                                <div onClick={() => handleRotateClick(setting.options[2].value)} className="mr-2 flex items-center cursor-pointer">
                                  <InputLabel className="mr-2">Right</InputLabel>
                                  <RotateRightIcon className="transform transition-transform duration-300 hover:scale-110" />
                                </div>
                            </div>
                          )}
                          {setting.key === 'horizontal' && (
                            <div className="flex justify-between mb-4">
                              <div className="flex items-center cursor-pointer" onClick={() => handleFlip('horizontal')}>
                                <FlipIcon sx={{ transform: imageSettings.flip.horizontal ? 'scaleX(-1)' : 'scaleX(1)' }} />
                                <InputLabel className="ml-2">Flip Horizontal</InputLabel>
                              </div>
                              <div className="flex items-center cursor-pointer" onClick={() => handleFlip('vertical')}>
                                <FlipIcon sx={{
                                  transform: `rotate(90deg) ${imageSettings.flip.vertical ? 'scaleX(-1)' : 'scaleX(1)'}`,
                                }} />
                                <InputLabel className="ml-2">Flip Vertical</InputLabel>
                              </div>
                            </div>
                          )}
                        </div>
                      </Tooltip>
                    </div>
                  ))
                  }
                </div>
              ))
            )}
            </nav>
        </aside>

        {!settingsCollapsed && (
        <div className="p-2 absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-lg flex items-center justify-center">
          <CgPushRight onClick={() => setSettingsCollapsed(!settingsCollapsed)} className='text-lg sm:text-xl md:text-2xl'/>
        </div>
      )}
      
           {/* Image Display Section */}
           <div className="w-full p-4 bg-gray-300">
            <h2 className="text-xl text-center text-orange-500 font-bold mb-4">
              Image Editor
            </h2>
            <div className="p-4 w-full h-4/6 overflow-y-auto flex items-center justify-center">
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
            </div>

          {/* Image Thumbnails Section */}
          <ImageThumbnails
           uploadedImages={uploadedImages}
           selectedImageId={selectedImageId}
           setSelectedImageId={setSelectedImageId}
          />
        </div>

      {/* Action Section */}
      <aside className={`relative z-40 sm:z-auto top-0 right-0 sm:top-auto sm:right-auto transform ${actionsCollapsed ? 'w-1/4 translate-x-full sm:translate-x-0' : 'hidden translate-x-0'} transition-transform duration-300 h-screen bg-orange-100 shadow-lg text-gray-700`}>
        <nav className="flex flex-col p-2 sm:p-4 space-y-8 h-full">
          <CgPushRight onClick={() => setActionsCollapsed(!actionsCollapsed)} className='text-lg sm:text-xl md:text-2xl' />
          {actionsCollapsed && (
            <div className="flex flex-col items-center h-full">
              {/* Upload Options */}
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

              {/* Format Selection Dropdowns */}
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
              
              {/* Push the button to the bottom */}
              <div className="flex-grow"></div>
              <button onClick={() => handleImageSettingsChange(imageSettings)}>Apply Settings</button>

              {/* Convert Button */}
              <button
                className="bg-teal-500 flex justify-center items-center hover:bg-teal-600 text-white text-xs md:text-sm lg:text-lg font-bold py-4 px-4 lg:px-8 mt-4"
                onClick={() => handleConvertImages(uploadedImages, user, emailVerified, idToken, navigate, setDisplayType, setDownloadPageActive)}
              >
                Convert <FaArrowRight className="ml-4"/>
              </button>
            </div>
          )}
        </nav>
      </aside>
      {!actionsCollapsed && (
        <div className="p-2 absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-lg flex items-center justify-center">
          <CgPushLeft onClick={() => setActionsCollapsed(!actionsCollapsed)} className='text-lg sm:text-xl md:text-2xl'/>
        </div>
      )}
      </div>
    </div>
  );
};

export default EditImage;

