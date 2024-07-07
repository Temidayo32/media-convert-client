/* global cv, importScripts */
importScripts("./loadOpenCV.js");

// importScripts('https://docs.opencv.org/4.10.0/opencv.js'); 
async function processImage(imageData, imageSettings, canvasWidth, canvasHeight) {
    console.log('Processing image in worker:', imageData, imageSettings);
    await loadOpenCV();
    await new Promise((resolve) => waitForOpencvMat(resolve));

//   console.log(cv)
    let initialMat = cv.matFromImageData(imageData);
    let mat = initialMat.clone(); // Create a snapshot

    
    try {
        console.log(`Initial mat: cols=${mat.cols}, rows=${mat.rows}, channels=${mat.channels()}`);

        // Apply Brightness and Contrast
        if (imageSettings.brightness.alpha !== 1.0 || imageSettings.brightness.beta !== 0) {
            const { alpha, beta } = imageSettings.brightness;
            mat = applyBrightnessContrast(cv, mat, alpha, beta);
        }

        // Apply Blur
        if (imageSettings.blur.type !== 'None') {
            const { type, kernel_size } = imageSettings.blur;
            mat = applyBlur(cv, mat, type, kernel_size);
        }

        // Resize Image
        if (imageSettings.resize.width && imageSettings.resize.height) {
            const { width, height } = imageSettings.resize;
            mat = resizeImage(cv, mat, width, height);
        }

        // Apply Rotate
        if (imageSettings.rotate.angle !== 0) {
            const { angle } = imageSettings.rotate;
            mat = rotateImage(cv, mat, angle, canvasWidth, canvasHeight);
            // Calculate the scaling factor
            const scaleFactor = Math.min(canvasWidth / mat.cols, canvasHeight / mat.rows);

            // Calculate new dimensions
            const newWidth = mat.cols * scaleFactor;
            const newHeight = mat.rows * scaleFactor;
            mat = resizeImage(cv, mat, newWidth, newHeight)
        }

        // Flip Image
        if (imageSettings.flip.horizontal || imageSettings.flip.vertical) {
            mat = flipImage(cv, mat, imageSettings.flip.horizontal, imageSettings.flip.vertical);
        }

        // Convert to Gray for Edge Detection or Histogram Equalization if necessary
        if (imageSettings.edgeDetection.method !== 'None' || imageSettings.histogramEqualization.enabled) {
            mat = convertToGray(cv, mat);
        }

        // Perform Edge Detection
        if (imageSettings.edgeDetection.method === 'Canny') {
            mat = applyCannyEdgeDetection(cv, mat, imageSettings.edgeDetection.threshold1, imageSettings.edgeDetection.threshold2);
        } else if (imageSettings.edgeDetection.method === 'Sobel') {
            mat = applySobelEdgeDetection(cv, mat);
        }

        // Apply Histogram Equalization
        if (imageSettings.histogramEqualization.enabled) {
            mat = applyHistogramEqualization(cv, mat);
        }

        // Convert Color Space
        if (imageSettings.colorSpace.conversion !== 'None') {
            mat = convertColorSpace(cv, mat, imageSettings.colorSpace.conversion);
        }

        // Apply Color Manipulation (Saturation, Hue, Contrast)
        const { saturation, hue, contrast } = imageSettings.colorManipulation;
        if (saturation !== 1.0 || hue !== 0 || contrast !== 1.0) {
            mat = applyColorManipulation(cv, mat, saturation, hue, contrast);
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


function applyBrightnessContrast(cv, mat, alpha, beta) {
    let resultMat = new cv.Mat();
    mat.convertTo(resultMat, -1, alpha, beta);
    mat.delete();
    return resultMat;
}

function applyBlur(cv, mat, type, kernel_size) {
    let blurredMat = new cv.Mat();
    switch (type) {
        case 'Gaussian':
            cv.GaussianBlur(mat, blurredMat, new cv.Size(kernel_size, kernel_size), 0, 0, cv.BORDER_DEFAULT);
            break;
        case 'Median':
            if (kernel_size % 2 === 0) throw new Error('Kernel size for median blur must be odd');
            cv.medianBlur(mat, blurredMat, kernel_size);
            break;
        case 'Bilateral':
            cv.bilateralFilter(mat, blurredMat, kernel_size, kernel_size * 2, kernel_size / 2, cv.BORDER_DEFAULT);
            break;
        default:
            blurredMat = mat.clone();
            break;
    }
    mat.delete();
    return blurredMat;
}

function resizeImage(cv, mat, width, height) {
    let resizedMat = new cv.Mat();
    cv.resize(mat, resizedMat, new cv.Size(width, height), 0, 0, cv.INTER_AREA);
    mat.delete();
    return resizedMat;
}

function rotateImage(cv, mat, angle) {
    let center = new cv.Point(mat.cols / 2, mat.rows / 2);
    let M = cv.getRotationMatrix2D(center, angle, 1);

    // Calculate new bounding box size
    let cos = Math.abs(M.doubleAt(0, 0));
    let sin = Math.abs(M.doubleAt(0, 1));
    let newWidth = Math.floor(mat.rows * sin + mat.cols * cos);
    let newHeight = Math.floor(mat.rows * cos + mat.cols * sin);

    // Adjust rotation matrix to account for translation
    M.doublePtr(0, 2)[0] += (newWidth / 2) - center.x;
    M.doublePtr(1, 2)[0] += (newHeight / 2) - center.y;

    let rotatedMat = new cv.Mat();
    cv.warpAffine(mat, rotatedMat, M, new cv.Size(newWidth, newHeight), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

    mat.delete();
    return rotatedMat;
}


function flipImage(cv, mat, horizontal, vertical) {
    let flipCode = horizontal && vertical ? -1 : horizontal ? 1 : 0;
    let flippedMat = new cv.Mat();
    cv.flip(mat, flippedMat, flipCode);
    mat.delete();
    return flippedMat;
}

function convertToGray(cv, mat) {
    let grayMat = new cv.Mat();
    cv.cvtColor(mat, grayMat, cv.COLOR_RGBA2GRAY, 0);
    mat.delete();
    return grayMat;
}

function applyCannyEdgeDetection(cv, mat, threshold1, threshold2) {
    let edges = new cv.Mat();
    cv.Canny(mat, edges, threshold1, threshold2, 3, false);
    mat.delete();
    return edges;
}

function applySobelEdgeDetection(cv, mat) {
    let gradX = new cv.Mat();
    let gradY = new cv.Mat();
    let absGradX = new cv.Mat();
    let absGradY = new cv.Mat();
    let edges = new cv.Mat();
    cv.Sobel(mat, gradX, cv.CV_16S, 1, 0);
    cv.convertScaleAbs(gradX, absGradX);
    cv.Sobel(mat, gradY, cv.CV_16S, 0, 1);
    cv.convertScaleAbs(gradY, absGradY);
    cv.addWeighted(absGradX, 0.5, absGradY, 0.5, 0, edges);
    mat.delete();
    gradX.delete();
    gradY.delete();
    absGradX.delete();
    absGradY.delete();
    return edges;
}

function applyHistogramEqualization(cv, mat) {
    let equalizedMat = new cv.Mat();
    cv.equalizeHist(mat, equalizedMat);
    mat.delete();
    return equalizedMat;
}

function convertColorSpace(cv, mat, conversion) {
    let convertedMat = new cv.Mat();
    switch (conversion) {
        case 'GRAY':
            cv.cvtColor(mat, convertedMat, cv.COLOR_RGBA2GRAY, 0);
            break;
        case 'HSV':
            cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2HSV, 0);
            break;
        case 'HLS':
            cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2HLS);
            break;
        case 'LAB':
            cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2Lab, 0);
            break;
        case 'BGR':
            cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2BGR);
            break;
        case 'Luv':
            cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2Luv, 0);
            break;
        case 'YCrCb':
            cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2YCrCb);
            break;
        case 'YUV':
            cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2YUV);
            break;
        case 'XYZ':
            cv.cvtColor(mat, convertedMat, cv.COLOR_RGB2XYZ);
            break;
        default:
            convertedMat = mat.clone();
            break;
    }
    mat.delete();
    return convertedMat;
}

function applyColorManipulation(cv, mat, saturation, hue, contrast) {
    mat.convertTo(mat, -1, contrast, 0);
    cv.cvtColor(mat, mat, cv.COLOR_RGB2HSV);
    for (let i = 0; i < mat.rows; i++) {
        for (let j = 0; j < mat.cols; j++) {
            let pixel = mat.ucharPtr(i, j);
            pixel[1] = Math.max(0, Math.min(pixel[1] * saturation, 255));
            pixel[0] = (pixel[0] + hue) % 180;
        }
    }
    cv.cvtColor(mat, mat, cv.COLOR_HSV2RGB);
    return mat;
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

