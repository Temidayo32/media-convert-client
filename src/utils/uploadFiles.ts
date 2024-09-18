// the utility functions are for uploading files
import React, { Dispatch, SetStateAction } from 'react';
import { gapi } from 'gapi-script';
import { handleGoogleAuth } from './auth';
import { FileDetails, ImageFilter, VideoSettings } from '../typings/types';
import { S3Client, PutObjectCommand, GetObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import SparkMD5 from "spark-md5";
// Create an S3 client



declare global {
  interface Window {
    google: any; // Define 'google' as any to avoid type errors
  }
}

const FRONTEND_URL = process.env.REACT_APP_BASE_FRONTEND
const R2_BUCKET_NAME = process.env.REACT_APP_R2_BUCKET_NAME
const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024;
const CHUNK_SIZE = 5 * 1024 * 1024;
const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.REACT_APP_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.REACT_APP_R2_ACCESS_KEY!,
    secretAccessKey: process.env.REACT_APP_R2_SECRET_KEY!,
  },
});

function formatFileSize(bytes: number): string {
  const mbSize = bytes / (1024 * 1024);
  if (mbSize < 1024) {
    return mbSize.toFixed(2) + ' MB';
  } else {
    const gbSize = mbSize / 1024;
    return gbSize.toFixed(2) + ' GB';
  }
}

const generatePresignedUrl = async (key: string) => {
  try {
    // Create the command for uploading a file
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    // Generate the presigned URL, set to expire in 24 hours (60 * 60 * 24 seconds)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 });
    // console.log('Presigned URL:', presignedUrl);
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

async function uploadLargeR2Bucket (file: File | Blob, fileName: string, fileType: string) {
  const createMultipartUploadParams = {
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    ContentType: fileName,
  };

  const { UploadId } = await s3Client.send(new CreateMultipartUploadCommand(createMultipartUploadParams));

  let partNumber = 1;
  const uploadPromises = [];

  // Calculate total chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  // Read and upload each chunk using FileReader
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);

    const chunk = file.slice(start, end); // Slice the file into chunks

    const uploadPartParams = {
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
      PartNumber: partNumber,
      UploadId: UploadId,
      Body: chunk, // Blob data as Body
    };

    // console.log(`Uploading part ${partNumber} of size ${chunk.size} bytes`);

    const data = await s3Client.send(new UploadPartCommand(uploadPartParams));

    const eTag: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const arrayBuffer = e.target?.result;

        if (arrayBuffer && arrayBuffer instanceof ArrayBuffer) {
          const md5Hash = SparkMD5.ArrayBuffer.hash(arrayBuffer);
          resolve(md5Hash);  // Resolve the ETag (MD5 hash)
        } else {
          reject(new Error("Failed to read the file chunk correctly."));
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(chunk);
    });

    uploadPromises.push({
      PartNumber: partNumber,
      ETag: eTag,
    });

    partNumber++;
  }

  // console.log(uploadPromises)
  // Complete multipart upload
  const completeMultipartUploadParams = {
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    UploadId: UploadId,
    MultipartUpload: {
      Parts: uploadPromises.map(promise => ({
        PartNumber: promise.PartNumber,
        ETag: promise.ETag
      })),
    },
  };

  await s3Client.send(new CompleteMultipartUploadCommand(completeMultipartUploadParams));

  // console.log(`${fileName} uploaded to ${R2_BUCKET_NAME}/${fileName}`);
};



export async function uploadToR2Bucket ( file: File | Blob, fileName: string, fileType: string): Promise<void> {

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME!,
    Key: fileName,
    Body: file,
    ContentType: fileType,
  });

  try {
    // Upload the video to Cloudflare R2
    await s3Client.send(command);
    // console.log('Upload successful:', uploadData);

  } catch (error) {
    console.log(`An error occured: ${error}`)
  }
}

export async function uploadR2 (file: File | Blob, fileName: string, fileType: string): Promise<string> {
  const fileSize = file.size

  try {
      if (fileSize > LARGE_FILE_THRESHOLD) {
        // Use multipart upload for larger files
        await uploadLargeR2Bucket(file, fileName, fileType);
      } else {
        // Use regular single-part upload for smaller files
        await uploadToR2Bucket(file, fileName, fileType);
      }
      const presignedUrl = await generatePresignedUrl(fileName);
      // console.log('Presigned URL:', presignedUrl);
      return presignedUrl
    } catch (error) {
      console.log(`An error occured: ${error}`)
      return 'null'
    }
};

//upload for local device
export function handleFileUpload(
  e: React.ChangeEvent<HTMLInputElement>,
  defaultFormat: string,
  defaultSettings: VideoSettings | ImageFilter, // Adjust the type of defaultSettings as per your actual settings structure
  uploadedFiles: FileDetails[],
  setUploadedFiles: Dispatch<SetStateAction<FileDetails[]>>,
  emailVerified: boolean,
  setOversizedFiles: Dispatch<SetStateAction<string[]>>,
  setShowErrorMessages: Dispatch<SetStateAction<boolean>>,
  setShowUploadForm: Dispatch<SetStateAction<boolean>>
): void {
    const files = e.target.files!;
    const newFiles = [...uploadedFiles];
    const oversizedFiles = [];
  
    for (let i = 0; i < files.length; i++) {
      if (!emailVerified && files[i].size > MAX_FILE_SIZE) {
        oversizedFiles.push(`File size of ${files[i].name} exceeds the 1 GB limit.`);
        continue;
      }
  
      newFiles.push({
        source: 'local',
        file: files[i],
        name: files[i].name,
        size: formatFileSize(files[i].size),
        format: defaultFormat,
        jobId: `${Date.now()}_${files[i].name.split('.')[0]}`,
        settings: { ...defaultSettings },
      });
    }

    // console.log(newFiles)
    setUploadedFiles(newFiles);
    setOversizedFiles(oversizedFiles);
  
    if (oversizedFiles.length > 0) {
      setShowErrorMessages(true);
      setTimeout(() => {
        setShowErrorMessages(false);
      }, 5000); // 5 seconds timeout
    }
  
    setShowUploadForm(false);
}

//upload for dropbox
export function onSuccess(
  files: any[], // Replace `any[]` with a more specific type if available
  defaultFormat: string,
  defaultSettings: VideoSettings | ImageFilter,
  uploadedFiles: FileDetails[],
  setUploadedFiles: Dispatch<SetStateAction<FileDetails[]>>,
  emailVerified: boolean,
  setOversizedFiles: Dispatch<SetStateAction<string[]>>,
  setShowErrorMessages: Dispatch<SetStateAction<boolean>>,
  setShowUploadForm: Dispatch<SetStateAction<boolean>>
): void {
    const newFiles = [...uploadedFiles];
    const oversizedFiles = [];
  
    for (let i = 0; i < files.length; i++) {
      if (!emailVerified && files[i].bytes > MAX_FILE_SIZE) {
        oversizedFiles.push(`File size of ${files[i].name} exceeds the 1 GB limit.`);
        continue;
      }
  
      newFiles.push({
        source: 'dropbox',
        file: files[i],
        name: files[i].name,
        fileLink: files[i].link,
        size: formatFileSize(files[i].bytes),
        format: defaultFormat,
        jobId: `${Date.now()}_${files[i].name.split('.')[0]}`,
        settings: { ...defaultSettings },
      });
    }
  
    console.log(newFiles);
    setUploadedFiles(newFiles);
    setOversizedFiles(oversizedFiles);

    if (oversizedFiles.length > 0) {
      setShowErrorMessages(true);
      setTimeout(() => {
        setShowErrorMessages(false);
      }, 5000); // 5 seconds timeout
    }
  
    setShowUploadForm(false);
  }


  //function for upload from Google Drive
  export async function handleOpenPicker(
    developerKey: string,
    uploadedFiles: FileDetails[],
    setUploadedFiles: Dispatch<SetStateAction<FileDetails[]>>,
    defaultFormat: string,
    defaultSettings: VideoSettings | ImageFilter, // Adjust the type as per your default settings type
    emailVerified: boolean,
    setOversizedFiles: Dispatch<SetStateAction<string[]>>,
    setShowErrorMessages: Dispatch<SetStateAction<boolean>>,
    setShowUploadForm: Dispatch<SetStateAction<boolean>>,
    mimeTypePrefix: string
  ): Promise<void> {
    const accessToken = await handleGoogleAuth();
    if (!accessToken) {
      console.error('No access token obtained. Cannot proceed with Google Picker.');
      return;
    }
    // console.log(accessToken);

    gapi.load('picker', {
      callback: () => {
        try {
          const picker = new window.google.picker.PickerBuilder()
            .setOrigin(window.location.host)
            .setRelayUrl('https://docs.google.com')
            .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
            .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
            .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
            .setOAuthToken(accessToken)
            .setDeveloperKey(developerKey)
            .addView(new window.google.picker.DocsUploadView())
            .setCallback((data: any) => {
              if (data.action === window.google.picker.Action.CANCEL) {
                console.log('User clicked cancel/close button');
              } else if (data.docs) {
                const selectedFiles = data.docs.filter((doc: any) => doc.mimeType.startsWith(mimeTypePrefix));
                const newFiles = [...uploadedFiles];
                const oversizedFiles = [];

                for (let i = 0; i < selectedFiles.length; i++) {
                  if (!emailVerified && selectedFiles[i].sizeBytes > MAX_FILE_SIZE) {
                    oversizedFiles.push(`File size of ${selectedFiles[i].name} exceeds the 1 GB limit.`);
                    continue;
                  }

                  newFiles.push({
                    source: 'google',
                    file: selectedFiles[i],
                    fileId: selectedFiles[i].id,
                    name: selectedFiles[i].name,
                    size: formatFileSize(selectedFiles[i].sizeBytes),
                    format: defaultFormat,
                    jobId: `${Date.now()}_${selectedFiles[i].name.split('.')[0]}`,
                    settings: { ...defaultSettings },
                  });
                }

                setUploadedFiles(newFiles);
                setOversizedFiles(oversizedFiles);
  
                if (oversizedFiles.length > 0) {
                  setShowErrorMessages(true);
                  setTimeout(() => {
                    setShowErrorMessages(false);
                  }, 5000); // 5 seconds timeout
                }
  
                setShowUploadForm(false);
              }
            })
            .build();
  
          picker.setVisible(true);
        } catch (error) {
          console.error('Error occurred during Google Picker operation:', error);
        }
      },
      onerror: (error: any) => {
        console.error('Error loading Google Picker API:', error);
      }
    });
  }

//function return when cancel button is clicked.
export function onCancel() {
    console.log('Cancelled');
  }

