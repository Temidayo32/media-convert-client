export type ImageDataProps = {
    canvasHeight: number;
    canvasWidth: number;
    imageData: ImageData;
    colorSpace: string;
    height: number;
    width: number;
    imageSettings: ImageFilter;
}

interface DropboxFile {
    bytes: number;
    icon: string;
    id: string;
    isDir: boolean;
    link: string;
    linkType: string;
    name: string;
    thumbnailLink: string;
  }

export type FileDetails = {
    name: string,
    format: string,
    file: File | DropboxFile
    size: string,
    jobId: string,
    source: 'dropbox' | 'google' | 'local',
    fileLink?: string,
    fileId?: string,
    settings: VideoSettings | ImageFilter
}


export interface VideoSettings {
    selectedCodec?: string;
    selectedFrameRate?: string;
    selectedResolution?: string;
    selectedScale: {
      width?: string;
      height?: string;
    };
    selectedCropFilter?: string;
    selectedRotateFilter?: string;
    deshakeChecked: boolean;
    selectedDenoise?: string;
    selectedAspectRatio?: string;
    selectedAudioCodec?: string;
    volume: number;
    noAudio: boolean;
  }
  

export interface ImageFilter {
    brightness: {
      alpha: number;
      beta: number;
    };
    blur: {
      type: 'None' | 'Gaussian' | 'Median' | 'Bilateral';
      kernel_size: number;
    };
    resize: {
      width: number | null;
      height: number | null;
    };
    rotate: {
      angle: number;
    };
    crop: {
      x: number;
      y: number;
      width: number | null;
      height: number | null;
    };
    edgeDetection: {
      method: 'None' | 'Canny' | 'Sobel';
      threshold1: number;
      threshold2: number;
    };
    colorSpace: {
      conversion: 'None' | 'GRAY' | 'HSV' | 'HLS' | 'LAB' | 'BGR' | 'LUV' | 'YCrCb' | 'YUV' | 'XYZ';
    };
    histogramEqualization: boolean;
    colorManipulation: {
      saturation: number;
      hue: number;
      contrast: number;
    };
    flip: {
      horizontal: boolean;
      vertical: boolean;
    };
  }
  
export interface Task {
  completedAt?: string;
  fileUrl?: string;
  format: string;
  mimeType: string;
  name: string;
  progress: string;
  userId: string;
  [key: string]: any;
}