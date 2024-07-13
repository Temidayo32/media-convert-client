/* global cv, importScripts */
function loadScriptsWithRetry(scripts, retryCount = 3, retryDelay = 1000) {
    function loadScripts() {
        try {
            importScripts(...scripts);
            console.log('Scripts loaded successfully');
        } catch (error) {
            console.error('Error loading scripts:', error);
            if (retryCount > 0) {
                console.log(`Retrying in ${retryDelay} ms... (${retryCount} retries left)`);
                setTimeout(() => {
                    loadScriptsWithRetry(scripts, retryCount - 1, retryDelay);
                }, retryDelay);
            } else {
                console.error('Failed to load scripts after multiple attempts');
                // Handle the error or notify the main thread about the failure
                self.postMessage({ type: 'error', message: 'Failed to load scripts after multiple attempts' });
            }
        }
    }
    loadScripts();
}

// List of scripts to load
const scriptsToLoad = [
    "./loadOpenCV.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jimp/0.22.12/jimp.min.js",
    './ImageProcessor.js'
];

// Start loading scripts with retry logic
loadScriptsWithRetry(scriptsToLoad);


 
async function processImage(imageData, imageSettings, canvasWidth, canvasHeight) {
    // console.log('Processing image in worker:', imageData, imageSettings);
    await loadOpenCV();
    await new Promise((resolve) => waitForOpencvMat(resolve));

    const processor = new ImageProcessor(cv, Jimp);
    let initialMat = cv.matFromImageData(imageData);
    let mat = initialMat.clone(); // Create a snapshot

    
    try {
        console.log(`Initial mat: cols=${mat.cols}, rows=${mat.rows}, channels=${mat.channels()}`);

         // Crop Image with Jimp
         if (imageSettings.crop.width && imageSettings.crop.height) {
            const { x, y, width, height } = imageSettings.crop;
            if (x >= 0 && y >= 0 && x + width <= mat.cols && y + height <= mat.rows) {
                const base64 = await processor.cropImageWithJimp(imageData, x, y, width, height);
                imageData = await processor.loadImageDataFromBase64(base64);
                mat.delete();
                mat = cv.matFromImageData(new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height));
            } else {
                console.error('Invalid crop dimensions.');
            }
        }

        // Apply Brightness and Contrast
        if (imageSettings.brightness.alpha !== 1.0 || imageSettings.brightness.beta !== 0) {
            const { alpha, beta } = imageSettings.brightness;
            mat = processor.applyBrightnessContrast(mat, alpha, beta);
        }

        // Apply Blur
        if (imageSettings.blur.type !== 'None') {
            const { type, kernel_size } = imageSettings.blur;
            mat = processor.applyBlur(mat, type, kernel_size);
        }

        // Resize Image
        if (imageSettings.resize.width && imageSettings.resize.height) {
            const { width, height } = imageSettings.resize;
            mat = processor.resizeImage(mat, width, height);
        }

        // Apply Rotate
        if (imageSettings.rotate.angle !== 0) {
            const { angle } = imageSettings.rotate;
            mat = processor.rotateImage(mat, angle, canvasWidth, canvasHeight);
            // Calculate the scaling factor
            const scaleFactor = Math.min(canvasWidth / mat.cols, canvasHeight / mat.rows);

            // Calculate new dimensions
            const newWidth = mat.cols * scaleFactor;
            const newHeight = mat.rows * scaleFactor;
            mat = processor.resizeImage(mat, newWidth, newHeight)
        }

        // Flip Image
        if (imageSettings.flip.horizontal || imageSettings.flip.vertical) {
            mat = processor.flipImage(mat, imageSettings.flip.horizontal, imageSettings.flip.vertical);
        }

        // Convert to Gray for Edge Detection or Histogram Equalization if necessary
        if (imageSettings.edgeDetection.method !== 'None' || imageSettings.histogramEqualization.enabled) {
            mat = processor.convertToGray(mat);
        }

        // Perform Edge Detection
        if (imageSettings.edgeDetection.method === 'Canny') {
            mat = processor.applyCannyEdgeDetection(mat, imageSettings.edgeDetection.threshold1, imageSettings.edgeDetection.threshold2);
        } else if (imageSettings.edgeDetection.method === 'Sobel') {
            mat = processor.applySobelEdgeDetection(mat);
        }

        // Apply Histogram Equalization
        if (imageSettings.histogramEqualization.enabled) {
            mat = processor.applyHistogramEqualization(mat);
        }

        // Convert Color Space
        if (imageSettings.colorSpace.conversion !== 'None') {
            mat = processor.convertColorSpace(mat, imageSettings.colorSpace.conversion);
        }

        // Apply Color Manipulation (Saturation, Hue, Contrast)
        const { saturation, hue, contrast } = imageSettings.colorManipulation;
        if (saturation !== 1.0 || hue !== 0 || contrast !== 1.0) {
            mat = processor.applyColorManipulation(mat, saturation, hue, contrast);
        }

         // Convert back to RGBA format for rendering
        if (mat.channels() === 1) {
            // If the image is in grayscale, convert it back to RGBA
            cv.cvtColor(mat, mat, cv.COLOR_GRAY2RGBA);
        } else if (mat.channels() === 3) {
            // If the image is in RGB, convert it back to RGBA
            cv.cvtColor(mat, mat, cv.COLOR_RGB2RGBA);
        } else if (imageSettings.colorSpace.conversion === 'HSV') {
            cv.cvtColor(mat, mat, cv.COLOR_HSV2RGBA);
        } else if (imageSettings.colorSpace.conversion === 'HLS') {
            cv.cvtColor(mat, mat, cv.COLOR_HLS2RGBA);
        } else if (imageSettings.colorSpace.conversion === 'LAB') {
            cv.cvtColor(mat, mat, cv.COLOR_Lab2RGBA);
        } else if (imageSettings.colorSpace.conversion === 'Luv') {
            cv.cvtColor(mat, mat, cv.COLOR_Luv2RGBA);
        } else if (imageSettings.colorSpace.conversion === 'YCrCb') {
            cv.cvtColor(mat, mat, cv.COLOR_YCrCb2RGBA);
        } else if (imageSettings.colorSpace.conversion === 'YUV') {
            cv.cvtColor(mat, mat, cv.COLOR_YUV2RGBA);
        } else if (imageSettings.colorSpace.conversion === 'XYZ') {
            cv.cvtColor(mat, mat, cv.COLOR_XYZ2RGBA);
        }

        // Ensure the data length matches 4 * width * height
        const expectedLength = 4 * mat.cols * mat.rows;
        if (mat.data.length !== expectedLength) {
            throw new Error(`Data length mismatch: expected ${expectedLength}, got ${mat.data.length}`);
        }

        // Convert back to ImageData
        const processedImageData = new ImageData(
            new Uint8ClampedArray(mat.data),
            mat.cols,
            mat.rows
        );

        return processedImageData;
    } catch (error) {
        console.error("Error applying settings:", error);
        throw error;
    } finally {
        initialMat.delete(); // Clean up initial snapshot
        mat.delete(); // Clean up final processed mat
    }
}


self.onmessage = async function(event) {
    const { imageData, imageSettings, canvasWidth, canvasHeight } = event.data;

    try {
        await loadOpenCV();
        waitForOpencvMat((cvMatReady) => {
            if (cvMatReady) {
                // console.log(cvMatReady)
                processImage(imageData, imageSettings, canvasWidth, canvasHeight)
                    .then((processedImageData) => {
                        self.postMessage({ processedImageData });
                    })
                    .catch((error) => {
                        self.postMessage({ error: error.message });
                    });
            } else {
                throw new Error('cv.Mat not ready');
            }
        });
    } catch (error) {
        self.postMessage({ error: error.message });
    }
};

