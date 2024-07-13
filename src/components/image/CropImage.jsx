import Cropper from 'react-easy-crop';
import { useState, useEffect } from 'react';


const CropImage = ({ imageDataUrl, aspect, onCropComplete, triggerCrop }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedArea, setCroppedArea] = useState(null);

  // Function to handle crop change
  const onCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  // Function to handle zoom change
  const onZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    setCroppedArea(croppedArea)
    if (triggerCrop) {
      onCropComplete(croppedArea, croppedAreaPixels); // Trigger the parent's onCropComplete
    }
  };

  useEffect(() => {
    if (triggerCrop && croppedAreaPixels) {
      onCropComplete(croppedArea, croppedAreaPixels);
    }
  }, [triggerCrop, croppedAreaPixels, onCropComplete]);

  return (
    <div className="crop-container">
      {imageDataUrl && (
        <Cropper
          image={imageDataUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default CropImage;
