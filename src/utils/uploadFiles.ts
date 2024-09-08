// the utility functions are for uploading files
import React, { Dispatch, SetStateAction } from 'react';
import { gapi } from 'gapi-script';
import { handleGoogleAuth } from './auth';
import { FileDetails, ImageFilter, VideoSettings } from '../typings/types';

declare global {
  interface Window {
    google: any; // Define 'google' as any to avoid type errors
  }
}


const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  const mbSize = bytes / (1024 * 1024);
  if (mbSize < 1024) {
    return mbSize.toFixed(2) + ' MB';
  } else {
    const gbSize = mbSize / 1024;
    return gbSize.toFixed(2) + ' GB';
  }
}


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
            .setOrigin("https://localhost:3000")
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
  
