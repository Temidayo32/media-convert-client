const getCanvasImage = () => {
    const format = formatMap[image.format.toLowerCase()] || 'image/jpeg'; 
    return canvasRef.current.toDataURL(format);
  };
  

   const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (cropStart && cropEnd && isPointInCrop(x, y)) {
      setIsDragging(true);
      setDragStart({ x, y });
    } else {
      setCropStart({ x, y });
      setCropEnd(null);
      setIsCropping(true);
      setIsDragging(false);
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isCropping) {
      setCropEnd({ x, y });
    } else if (isDragging && dragStart) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      setCropStart(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setCropEnd(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsCropping(false);
    setIsDragging(false);
  };

  const handleCropMouseDown = (e) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleOutsideClick = (e) => {
    if (canvasRef.current && !canvasRef.current.contains(e.target)) {
      setCropStart(null);
      setCropEnd(null);
      setDragStart(null)
    }
  };


  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    handleCropChange();
  }, [cropStart, cropEnd]);

  const handleCropChange = () => {
    if (cropStart && cropEnd) {
      setImageSettings(prevSettings => ({
        ...prevSettings,
        crop: {
          x: Math.min(cropStart.x, cropEnd.x),
          y: Math.min(cropStart.y, cropEnd.y),
          width: Math.abs(cropEnd.x - cropStart.x),
          height: Math.abs(cropEnd.y - cropStart.y),
        }
      }));
    }
  };

  const applyCrop = async () => {
    if (!cropStart || !cropEnd) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = getCanvasImage();

    img.onload = async () => {
      const croppedWidth = cropEnd.x - cropStart.x;
      const croppedHeight = cropEnd.y - cropStart.y;
      canvas.width = croppedWidth;
      canvas.height = croppedHeight;
      ctx.drawImage(
        img,
        cropStart.x, // source x
        cropStart.y, // source y
        croppedWidth, // source width
        croppedHeight, // source height
        0, // destination x
        0, // destination y
        croppedWidth, // destination width
        croppedHeight // destination height
      );
    };
  };

  const isPointInCrop = (x, y) => {
    return (
      x >= Math.min(cropStart.x, cropEnd.x) &&
      x <= Math.max(cropStart.x, cropEnd.x) &&
      y >= Math.min(cropStart.y, cropEnd.y) &&
      y <= Math.max(cropStart.y, cropEnd.y)
    );
  };
  // Apply Crop
if (imageSettings.crop.width && imageSettings.crop.height) {
    let { x, y, width, height } = imageSettings.crop;

    // Log the initial crop values
        console.log('Initial Crop Values:', { x, y, width, height });

        // Ensure the coordinates are within bounds
        x = Math.max(0, x);
        y = Math.max(0, y);
        width = Math.min(width, mat.cols - x);
        height = Math.min(height, mat.rows - y);

        // Log the adjusted crop values
        console.log('Adjusted Crop Values:', { x, y, width, height });

        try {
          // Create the cropped rectangle
          let cropRect = new cv.Rect(x, y, width, height);
          // Log the crop rectangle
          console.log('Crop Rect:', cropRect);

          // Perform the crop
          let croppedMat = mat.roi(cropRect);
          // Log the result
          console.log('Cropped Mat Size:', { width: croppedMat.cols, height: croppedMat.rows });

          // Update the canvas dimensions
          canvas.width = croppedMat.cols;
          canvas.height = croppedMat.rows;

          // Clean up the old mat
          mat.delete();
          mat = croppedMat;

          // Log the success
          console.log('Cropping successful');
        } catch (error) {
          console.error('Cropping failed:', error);
        }
      }



      {category.category === 'crop' ? (
        <div className="flex flex-col items-start">
          <label>X:</label>
          <input
            type="number"
            value={imageSettings.crop.x}
            onChange={(e) =>
              handleSettingChange('crop', 'x', parseInt(e.target.value))
            }
            className="border border-gray-300 p-1 rounded"
          />
          <label>Y:</label>
          <input
            type="number"
            value={imageSettings.crop.y}
            onChange={(e) =>
              handleSettingChange('crop', 'y', parseInt(e.target.value))
            }
            className="border border-gray-300 p-1 rounded"
          />
          <label>Width:</label>
          <input
            type="number"
            value={imageSettings.crop.width}
            onChange={(e) =>
              handleSettingChange('crop', 'width', parseInt(e.target.value))
            }
            className="border border-gray-300 p-1 rounded"
          />
          <label>Height:</label>
          <input
            type="number"
            value={imageSettings.crop.height}
            onChange={(e) =>
              handleSettingChange('crop', 'height', parseInt(e.target.value))
            }
            className="border border-gray-300 p-1 rounded"
          />
        </div>):(console.log('images'))}


onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}

{cropStart && cropEnd && (
    <div
      style={{
        position: 'absolute',
        left: Math.min(cropStart.x, cropEnd.x),
        top: Math.min(cropStart.y, cropEnd.y),
        width: Math.abs(cropEnd.x - cropStart.x),
        height: Math.abs(cropEnd.y - cropStart.y),
        border: '2px dashed #fff',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        // pointerEvents: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleCropMouseDown}
    ></div>
  )}


  
            {/* <button onClick={handleStartCropping} className="mt-4 p-2 bg-blue-500 text-white rounded">
              Start Cropping
            </button> */}
            <button onClick={applyCrop} className="mt-4 p-2 bg-blue-500 text-white rounded">Crop Image</button>


export function getCropDimensions(originalWidth, originalHeight, aspectRatio) {
    let newWidth = originalWidth, newHeight;
    switch (aspectRatio) {
        case '1:1':
            newHeight = originalWidth; // Make height equal to width for a square aspect ratio
            break;
        case '3:2':
            newHeight = originalWidth / 1.5; // Height is 2/3 of the width
            break;
        case '4:3':
            newHeight = originalWidth * 3 / 4; 
            break;
        case '5:3':
            newHeight = originalWidth * 3 / 5; // Height is 3/5 of the width
            break;
        case '6:4':
            newHeight = originalWidth * 2 / 3; // Height is 2/3 of the width
            break;
        case '10:8':
            newHeight = originalWidth * 4 / 5; // Height is 4/5 of the width
            break;
        case '16:9':
            newHeight = originalWidth * 9 / 16; // Height is 9/16 of the width
            break;
        default:
            newHeight = originalHeight; 
    }
    return { newWidth, newHeight };
}

export const getCroppedImg = (imageSrc, crop, format = 'image/jpeg', canvasRef) => {
    const createImage = url =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', error => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // Needed to avoid cross-origin issues on CodeSandbox
        image.src = url;
    });

    const getCroppedImg = async (imageSrc, pixelCrop, format, canvasRef) => {
    const image = await createImage(imageSrc);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to the crop dimensions
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise(resolve => {
        canvas.toBlob(file => {
        resolve(URL.createObjectURL(file));
        }, format);
    });
    };

    return getCroppedImg(imageSrc, crop, format, canvasRef);
};

import {Canvg} from 'canvg';
const renderSVG = async () => {
  if (!image || !canvasRef.current) return;
  
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  let v = null;

  try {
    const adjustCanvasDimensions = (width, height) => {
      canvas.width = width;
      canvas.height = height;
    };

    if (image.source === 'local') {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          v = await Canvg.from(ctx, reader.result);
          adjustCanvasDimensions(v.document.width, v.document.height);
          v.start();
          applySettings(canvas);
        } catch (canvgError) {
          console.error('Error in Canvg:', canvgError);
        }
      };
      reader.readAsText(image.file);
    } else if (image.source === 'dropbox') {
      const response = await fetch(image.fileLink.replace('dl=0', 'raw=1'), { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const svgText = await response.text();
      try {
        v = await Canvg.from(ctx, svgText);
        adjustCanvasDimensions(v.document.width, v.document.height);
        v.start();
        applySettings(canvas);
      } catch (canvgError) {
        console.error('Error in Canvg:', canvgError);
      }
    }
  } catch (error) {
    console.error('Error rendering SVG:', error);
  }
};

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