// Function to load OpenCV.js and ensure cv.Mat is ready
let cvReady = false;
let cvLoadingPromise = null;

async function loadOpenCV() {
    if (cvReady) {
        return Promise.resolve();
    }

    if (cvLoadingPromise) {
        return cvLoadingPromise;
    }

    cvLoadingPromise = new Promise((resolve, reject) => {
        if (typeof cv !== 'undefined') {
            if (cv.hasOwnProperty('onRuntimeInitialized')) {
                cv['onRuntimeInitialized'] = () => {
                    cvReady = true;
                    resolve();
                };
            } else {
                resolve();
            }
        } else {
            importScripts('./opencv.js');
            if (typeof cv !== 'undefined') {
                cv['onRuntimeInitialized'] = () => {
                    cvReady = true;
                    resolve();
                };
            } else {
                reject(new Error('Failed to load OpenCV.js'));
            }
        }
    });

    return cvLoadingPromise;
}

// Function to wait for cv.Mat to be ready
async function waitForOpencvMat(callbackFn, waitTimeMs = 30000, stepTimeMs = 100) {
    if (typeof cv !== 'undefined' && cv.Mat) {
        // console.log(cv)
        callbackFn(true);
        return;
    }

    let timeSpentMs = 0;
    const interval = setInterval(() => {
        const limitReached = timeSpentMs > waitTimeMs;
        if (typeof cv !== 'undefined' && cv.Mat || limitReached) {
            clearInterval(interval);
            callbackFn(!!cv.Mat); // Convert cv.Mat to boolean
        } else {
            timeSpentMs += stepTimeMs;
        }
    }, stepTimeMs);
}