class ImageProcessor {
    constructor(cv, Jimp) {
        this.cv = cv;
        this.Jimp = Jimp;
    }

    applyBrightnessContrast(mat, alpha, beta) {
        let resultMat = new this.cv.Mat();
        mat.convertTo(resultMat, -1, alpha, beta);
        mat.delete();
        return resultMat;
    }

    applyBlur(mat, type, kernel_size) {
        let blurredMat = new this.cv.Mat();
        switch (type) {
            case 'Gaussian':
                this.cv.GaussianBlur(mat, blurredMat, new this.cv.Size(kernel_size, kernel_size), 0, 0, this.cv.BORDER_DEFAULT);
                break;
            case 'Median':
                if (kernel_size % 2 === 0) throw new Error('Kernel size for median blur must be odd');
                this.cv.medianBlur(mat, blurredMat, kernel_size);
                break;
            // case 'Bilateral':
            //     this.cv.bilateralFilter(mat, blurredMat, kernel_size, kernel_size * 2, kernel_size / 2, this.cv.BORDER_DEFAULT);
            //     break;
            default:
                blurredMat = mat.clone();
                break;
        }
        mat.delete();
        return blurredMat;
    }

    resizeImage(mat, width, height) {
        let resizedMat = new this.cv.Mat();
        this.cv.resize(mat, resizedMat, new this.cv.Size(width, height), 0, 0, this.cv.INTER_AREA);
        mat.delete();
        return resizedMat;
    }

    rotateImage(mat, angle) {
        let center = new this.cv.Point(mat.cols / 2, mat.rows / 2);
        let M = this.cv.getRotationMatrix2D(center, angle, 1);

        // Calculate new bounding box size
        let cos = Math.abs(M.doubleAt(0, 0));
        let sin = Math.abs(M.doubleAt(0, 1));
        let newWidth = Math.floor(mat.rows * sin + mat.cols * cos);
        let newHeight = Math.floor(mat.rows * cos + mat.cols * sin);

        // Adjust rotation matrix to account for translation
        M.doublePtr(0, 2)[0] += (newWidth / 2) - center.x;
        M.doublePtr(1, 2)[0] += (newHeight / 2) - center.y;

        let rotatedMat = new this.cv.Mat();
        this.cv.warpAffine(mat, rotatedMat, M, new this.cv.Size(newWidth, newHeight), this.cv.INTER_LINEAR, this.cv.BORDER_CONSTANT, new this.cv.Scalar());

        mat.delete();
        return rotatedMat;
    }

    async cropImageWithJimp(imageData, x, y, width, height) {
        try {
            const jimpImage = await this.Jimp.read(imageData);
            jimpImage.crop(x, y, width, height);
            return await jimpImage.getBase64Async(this.Jimp.MIME_JPEG);
        } catch (error) {
            console.error('Error cropping image with Jimp:', error);
            throw error;
        }
    }

    async loadImageDataFromBase64(base64) {
        try {
            const jimpImage = await this.Jimp.read(base64);
            const { width, height, data } = jimpImage.bitmap;
            return new ImageData(new Uint8ClampedArray(data), width, height);
        } catch (error) {
            console.error('Error converting base64 to ImageData:', error);
            throw error;
        }
    }

    async matToBase64(mat) {
        try {
            const imgData = new ImageData(
                new Uint8ClampedArray(mat.data),
                mat.cols,
                mat.rows
            );
            const jimpImage = await this.Jimp.read(Buffer.from(imgData.data.buffer));
            return await jimpImage.getBase64Async(this.Jimp.MIME_JPEG);
        } catch (error) {
            console.error('Error converting Mat to base64:', error);
            throw error;
        }
    }

    flipImage(mat, horizontal, vertical) {
        let flipCode = horizontal && vertical ? -1 : horizontal ? 1 : 0;
        let flippedMat = new this.cv.Mat();
        this.cv.flip(mat, flippedMat, flipCode);
        mat.delete();
        return flippedMat;
    }

    convertToGray(mat) {
        let grayMat = new this.cv.Mat();
        this.cv.cvtColor(mat, grayMat, this.cv.COLOR_RGBA2GRAY, 0);
        mat.delete();
        return grayMat;
    }

    applyCannyEdgeDetection(mat, threshold1, threshold2) {
        let edges = new this.cv.Mat();
        this.cv.Canny(mat, edges, threshold1, threshold2, 3, false);
        mat.delete();
        return edges;
    }

    applySobelEdgeDetection(mat) {
        let gradX = new this.cv.Mat();
        let gradY = new this.cv.Mat();
        let absGradX = new this.cv.Mat();
        let absGradY = new this.cv.Mat();
        let edges = new this.cv.Mat();
        this.cv.Sobel(mat, gradX, this.cv.CV_16S, 1, 0);
        this.cv.convertScaleAbs(gradX, absGradX);
        this.cv.Sobel(mat, gradY, this.cv.CV_16S, 0, 1);
        this.cv.convertScaleAbs(gradY, absGradY);
        this.cv.addWeighted(absGradX, 0.5, absGradY, 0.5, 0, edges);
        mat.delete();
        gradX.delete();
        gradY.delete();
        absGradX.delete();
        absGradY.delete();
        return edges;
    }

    applyHistogramEqualization(mat) {
        let equalizedMat = new this.cv.Mat();
        this.cv.equalizeHist(mat, equalizedMat);
        mat.delete();
        return equalizedMat;
    }

    convertColorSpace(mat, conversion) {
        let convertedMat = new this.cv.Mat();
        switch (conversion) {
            case 'GRAY':
                this.cv.cvtColor(mat, convertedMat, this.cv.COLOR_RGBA2GRAY, 0);
                break;
            case 'HSV':
                this.cv.cvtColor(mat, convertedMat, this.cv.COLOR_RGB2HSV, 0);
                break;
            case 'HLS':
                this.cv.cvtColor(mat, convertedMat, this.cv.COLOR_RGB2HLS);
                break;
            case 'LAB':
                this.cv.cvtColor(mat, convertedMat, this.cv.COLOR_RGB2Lab, 0);
                break;
            case 'BGR':
                this.cv.cvtColor(mat, convertedMat, this.cv.COLOR_RGB2BGR);
                break;
            case 'Luv':
                this.cv.cvtColor(mat, convertedMat, this.cv.COLOR_RGB2Luv, 0);
                break;
            case 'YCrCb':
                this.cv.cvtColor(mat, convertedMat, this.cv.COLOR_RGB2YCrCb);
                break;
            case 'YUV':
                this.cv.cvtColor(mat, convertedMat, this.cv.COLOR_RGB2YUV);
                break;
            case 'XYZ':
                this.cv.cvtColor(mat, convertedMat, this.cv.COLOR_RGB2XYZ);
                break;
            default:
                convertedMat = mat.clone();
                break;
        }
        mat.delete();
        return convertedMat;
    }

    applyColorManipulation(mat, saturation, hue, contrast) {
        mat.convertTo(mat, -1, contrast, 0);
        this.cv.cvtColor(mat, mat, this.cv.COLOR_RGB2HSV);
        for (let i = 0; i < mat.rows; i++) {
            for (let j = 0; j < mat.cols; j++) {
                let pixel = mat.ucharPtr(i, j);
                pixel[1] = Math.max(0, Math.min(pixel[1] * saturation, 255));
                pixel[0] = (pixel[0] + hue) % 180;
            }
        }
        this.cv.cvtColor(mat, mat, this.cv.COLOR_HSV2RGB);
        return mat;
    }
}