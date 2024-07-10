import { UnsupportedImageFormatError } from "./error";


type Crop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const supportedFormats = ['jpeg', 'jpg', 'png', 'bmp', 'svg'];

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (error) => reject(error));
    img.src = url;
  });


const getCroppedImg = async (imageSrc: string, crop: Crop, format: string = 'jpeg'): Promise<string> => {
    try {
      if (!supportedFormats.includes(format)) {
        throw new UnsupportedImageFormatError(`Unsupported image format: ${format}`);
      }
  
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
  
      canvas.width = crop.width;
      canvas.height = crop.height;
  
      if (format === 'svg') {
        const svgBlob = new Blob([imageSrc], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.src = svgUrl;
  
        return new Promise((resolve, reject) => {
          img.onload = () => {
            ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
            URL.revokeObjectURL(svgUrl);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(URL.createObjectURL(blob));
                } else {
                  reject(new Error('Canvas is empty'));
                }
              },
              `image/${format}`
            );
          };
          img.onerror = reject;
        });
      } else {
        ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  
        return new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(URL.createObjectURL(blob));
              } else {
                reject(new Error('Canvas is empty'));
              }
            },
            `image/${format}`
          );
        });
      }
    } catch (error) {
      console.error('Error in getCroppedImg:', error);
      throw error; // Re-throw the error to propagate it further if needed
    }
  };
  
  export default getCroppedImg;