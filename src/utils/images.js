import axios from 'axios';


export const imageSettingsConfig = [
    {
      category: 'brightness',
      settings: [
        { key: 'alpha', label: 'Brightness Alpha', type: 'range', min: 0.1, max: 3.0, step: 0.1 },
        { key: 'beta', label: 'Brightness Beta', type: 'range', min: -100, max: 100, step: 1 },
      ],
    },
    {
      category: 'blur',
      settings: [
        {
          key: 'type',
          label: 'Blur Type',
          type: 'select',
          options: [
            { value: 'None', label: 'None' },
            { value: 'Gaussian', label: 'Gaussian' },
            { value: 'Median', label: 'Median' },
            { value: 'Bilateral', label: 'Bilateral' },
          ],
        },
        {
          key: 'kernel_size',
          label: 'Kernel Size',
          type: 'number',
          min: 1,
          max: 31,
          step: 2,
        },
      ],
    },
    {
      category: 'resize',
      settings: [
        { key: 'width', label: 'Width', type: 'number', min: 0, max: 5000, step: 1 },
        { key: 'height', label: 'Height', type: 'number', min: 0, max: 5000, step: 1 },
      ],
    },
    {
      category: 'rotate',
      settings: [
        {
          key: 'angle',
          label: 'Left',
          type: 'icon',
          options: [
            { value: 0, label: '0°' },
            { value: 45, label: '45°' },
            { value: 90, label: '90°' },
            { value: 135, label: '135°' },
            { value: 180, label: '180°' },
            { value: 225, label: '225°' },
            { value: 270, label: '270°' },
            { value: 315, label: '315°' },
          ],
        },
        {
          key: 'angle',
          label: 'Right',
          type: 'icon',
          options: [
            { value: 0, label: '0°' },
            { value: -45, label: '-45°' },
            { value: 90, label: '90°' },
            { value: 135, label: '135°' },
            { value: 180, label: '180°' },
            { value: 225, label: '225°' },
            { value: 270, label: '270°' },
            { value: 315, label: '315°' },
          ],
        },
      ],
    },
    // {
    //   category: 'crop',
    //   settings: [
    //     { key: 'x', label: 'X', type: 'number', min: 0, max: 5000, step: 1 },
    //     { key: 'y', label: 'Y', type: 'number', min: 0, max: 5000, step: 1 },
    //     { key: 'width', label: 'Width', type: 'number', min: 0, max: 5000, step: 1 },
    //     { key: 'height', label: 'Height', type: 'number', min: 0, max: 5000, step: 1 },
    //   ],
    // },
    {
      category: 'flip',
      settings: [
        {
          key: 'horizontal',
          label: 'Flip Horizontal',
          type: 'icon',
          options: [
            { value: true, label: 'Flip Horizontal' },
          ],
        },
        {
          key: 'vertical',
          label: 'Flip Vertical',
          type: 'icon',
          options: [
            { value: true, label: 'Flip Vertical' },
          ],
        },
      ],
    },
    {
      category: 'edgeDetection',
      settings: [
        {
          key: 'method',
          label: 'Edge Detection Method',
          type: 'select',
          options: [
            { value: 'None', label: 'None' },
            { value: 'Canny', label: 'Canny' },
            { value: 'Sobel', label: 'Sobel' },
          ],
        },
        { key: 'threshold1', label: 'Threshold 1', type: 'number', min: 0, max: 255, step: 1 },
        { key: 'threshold2', label: 'Threshold 2', type: 'number', min: 0, max: 255, step: 1 },
      ],
    },
    {
      category: 'colorSpace',
      settings: [
        {
          key: 'conversion',
          label: 'Color Space Conversion',
          type: 'select',
          options: [
            { value: 'None', label: 'None' },
            { value: 'GRAY', label: 'Gray' },
            { value: 'HSV', label: 'HSV' },
            { value: 'HLS', label: 'HLS' },
            { value: 'LAB', label: 'LAB' },
            { value: 'BGR', label: 'BGR' },
            { value: 'Luv', label: 'LUV' },
            {value: 'YCrCb', label: 'YCrCb'},
            { value: 'YUV', label: 'YUV' },
            { value: 'XYZ', label: 'XYZ' },
          ],
        },
      ],
    },
    {
      category: 'histogramEqualization',
      settings: [
        {
          key: 'enabled',
          label: 'Histogram Equalization',
          type: 'checkbox',
        },
      ],
    },
    {
      category: 'colorManipulation',
      settings: [
        { key: 'saturation', label: 'Saturation', type: 'range', min: 0.0, max: 2.0, step: 0.1 },
        { key: 'hue', label: 'Hue', type: 'range', min: -180, max: 180, step: 1 },
        { key: 'contrast', label: 'Contrast', type: 'range', min: 0.5, max: 1.5, step: 0.1 },
      ],
    },
  ];  

const convertImage = async (image, user, emailVerified, idToken) => {
    const fileNameWithoutExtension = image.name.split('.')[0];
    const fileExtension = image.name.split('.')[1];
  
    const formData = new FormData();
    formData.append('mimeType', 'image');
    formData.append('source', image.source);
    formData.append('image', image.file);
    formData.append('imageId', image.fileId);
    formData.append('jobId', image.jobId);
    formData.append('dropboxPath', image.fileLink);
    formData.append('imageName', fileNameWithoutExtension);
    formData.append('imageExt', fileExtension);
    formData.append('imageSize', image.size);
    formData.append('imageFormat', image.format);
    formData.append('imageSettings', JSON.stringify(image.settings));
  
    if (user && user.uid) {
      formData.append('userId', user.uid);
    }
  
    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}: ${value}`);
    // }
  
    // Determine the correct endpoint based on email verification
    let endpoint;
    if (emailVerified) {
      endpoint = image.source === 'local' ? '/image/signed/convertImage' : '/image/signed/convertcloudImage';
    } else {
      endpoint = image.source === 'local' ? '/image/convertImage' : '/image/convertcloudImage';
    }
  
    // Set up headers
    const headers = {
      'Content-Type': 'multipart/form-data',
    };
  
    if (idToken && emailVerified) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }
  
    const requestURL = endpoint;
  
    return axios
      .post(requestURL, formData, { headers, withCredentials: true })
      .then((data) => ({ success: true, data }))
      .catch((error) => ({ success: false, error }));
  };
  
export const handleConvertImages = async (uploadedImages, user, emailVerified, idToken, navigate, setDisplayType, setDownloadPageActive) => {
    const conversionPromises = uploadedImages.map((image) =>
      convertImage(image, user, emailVerified, idToken)
    );
  
    try {
      const results = await Promise.all(conversionPromises);
      const successfulConversions = results.filter(result => result.success);
      console.log(successfulConversions);
  
      if (successfulConversions.length > 0) {
        setDisplayType('images');
        setDownloadPageActive(true);
        navigate('/download');
      }
    } catch (error) {
      console.error('Error converting images:', error);
    }
  };


