import React, { useState } from 'react';
import { gapi } from 'gapi-script';
import { Dropbox, DropboxAuth } from 'dropbox';
import { dropboxAppKey } from '../../config/key';
import { handleGoogleAuth, handleDropboxAuth } from '../../utils/goggleAuth';
 
import { IoIosArrowDropdownCircle } from 'react-icons/io';
import { IoIosFolderOpen } from 'react-icons/io';
import { FaDropbox } from 'react-icons/fa';
import { DiGoogleDrive } from 'react-icons/di';


const CHUNK_SIZE = 8 * 1024 * 1024;

const DownloadOptions = ({ item, downloadUrl, progress }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [googleUploadProgress, setGoogleUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [googleUploading, setGoogleUploading] = useState(false);
  
    const handleUploadToDropbox = async () => {
      try {
        setUploading(true);
        const token = await handleDropboxAuth();
      
        if (!downloadUrl) {
          console.log('downloadUrl missing')
          return;
        }

        const dbx = new Dropbox({ accessToken: token.result.access_token });
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
    
        const arrayBuffer = await response.arrayBuffer();
        const totalSize = arrayBuffer.byteLength;
        let uploadedBytes = 0
    
        console.log('Starting upload to Dropbox...');
        // console.log(dropboxToken)
        let sessionId;
        let offset = 0;
    
        while (offset < totalSize) {
          const chunk = arrayBuffer.slice(offset, offset + CHUNK_SIZE);
          const blob = new Blob([chunk], { type: 'application/octet-stream' });
    
          if (!sessionId) {
            // Start upload session
            const sessionResponse = await dbx.filesUploadSessionStart({ close: false, contents: blob });
            sessionId = sessionResponse.result.session_id;
          } else {
            // Append to upload session
            await dbx.filesUploadSessionAppendV2({
              cursor: { session_id: sessionId, offset },
              close: false,
              contents: blob,
            });
          }
    
          offset += CHUNK_SIZE;
          uploadedBytes += chunk.byteLength; // Update the total uploaded bytes
          const progressPercentage = Math.round((uploadedBytes / totalSize) * 100); // Calculate progress percentage
          setUploadProgress(progressPercentage); 
          // console.log(`Uploaded chunk: ${offset / CHUNK_SIZE}`);
        }

        // console.log(typeof(totalSize))
        // console.log(sessionId)
    
        // Finish upload session
        const result = await dbx.filesUploadSessionFinish({
          cursor: { session_id: sessionId, offset: totalSize },
          commit: { path: `/${item.name.split('.')[0]}.${item.format}`, mode: 'add', autorename: true, mute: false },
        });
    
        console.log('Uploaded to Dropbox:', result);
      } catch (error) {
        console.error('Error uploading to Dropbox:', error);
      } finally {
        setTimeout(() => {
          setUploading(false); // Set uploading state to false when upload is complete or encounters an error
      }, 5000);
      }
    };
  
    const handleDownloadToDevice = () => {
      if (progress === 'completed' && downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${item.name.split('.')[0]}.${item.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    
  const handleUploadToGoogleDrive = async () => {  
    const accessToken = await handleGoogleAuth();
    // console.log(accessToken)

    if (!accessToken) {
      console.error('Access token not available.');
      return;
    }

    try {
        setGoogleUploading(true);      
        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const close_delim = `\r\n--${boundary}--`;
      
        const fileMetadata = {
            name: `${item.name.split('.')[0]}.${item.format}`,
        };

        console.log('Upload to Google Drive started...');

        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        // let uploadedBytes = 0

        // Convert ArrayBuffer to Base64
        const base64Data = await new Promise((resolve, reject) => {
            const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: application/octet-stream\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim;

        // Initialize XMLHttpRequest object
        const xhr = new XMLHttpRequest();

        // Set up event listener for progress tracking
        xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
                const percentage = Math.round((event.loaded / event.total) * 100);
                setGoogleUploadProgress(percentage);
                // Update progress state here if needed
            }
        });

        // Set up event listener for upload completion
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                // Handle completion of upload here
                if (xhr.status === 200 || xhr.status === 201) {
                    console.log('Uploaded to Google Drive:', xhr.responseText);
                    // Handle successful upload
                } else {
                    console.error('Error uploading file to Google Drive:', xhr.responseText);
                    // Handle error (e.g., show error message to the user)
                }
                // Set uploading state to false when upload is complete or encounters an error
                setTimeout(() => {
                  setGoogleUploading(false);
              }, 5000);
            }
        };

        // Open and send the request
        xhr.open("POST", "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart");
        xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
        xhr.setRequestHeader("Content-Type", `multipart/related; boundary=${boundary}`);
        xhr.send(multipartRequestBody);
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        // Handle error (e.g., show error message to the user)
        setGoogleUploading(false); // Set uploading state to false when upload encounters an error
    }
};


  return (
    <div className="relative inline-block text-left">
    <div
      className={`py-2 sm:px-4 px-8 md:px-8 lg:px-4 flex items-center justify-center lg:justify-start text-center gap-4 lg:gap-6 w-full rounded-t-lg transition-colors duration-300 ${progress === 'completed' ? 'bg-teal-500 hover:bg-teal-600 shadow-2xl drop-shadow-2xl text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
      id="options-menu"
      aria-expanded="true"
      aria-haspopup="true"
      onClick={() => setShowDropdown(true)}
    >
      <button
        type="button"
        disabled={progress !== 'completed'} 
        className={`text-sm sm:text-lg lg:text-xl ${progress === 'completed' ? 'text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
      >
        Download
      </button>
      <div className={`hidden lg:block lg:h-10 p-0 lg:w-0.5 ${progress === 'completed' ? 'bg-white' : 'bg-gray-600 cursor-not-allowed'}`}></div>
      <IoIosArrowDropdownCircle
        className={`hidden lg:block lg:text-2xl ${progress === 'completed' ? 'text-white cursor-pointer' : 'text-gray-500 cursor-not-allowed'}`}
      />
    </div>
    {showDropdown && progress === 'completed' && 
      <div 
        className="absolute top-full left-0 w-full bg-teal-500 text-center text-white rounded-b-lg shadow-lg z-30"
        onMouseLeave={() => setShowDropdown(false)}
        >
        <ul className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          <li className="cursor-pointer p-4 md:pl-8 bg-teal-500 hover:bg-teal-600 flex items-center transition-colors duration-300" role="menuitem">
            <IoIosFolderOpen className="hidden lg:block lg:text-2xl mr-4" />
            <button className="block text-left w-full text-sm md:text-base" onClick={handleDownloadToDevice}>
              Device
            </button>
          </li>
          <li className={`cursor-pointer p-4 bg-teal-500 hover:bg-teal-600 grid items-center transition-colors duration-300 ${uploading ? 'grid-rows-2' : 'grid-rows-1'}`} role="menuitem">
              <div className="flex items-center md:pl-4">
                  <FaDropbox className="hidden lg:block lg:text-2xl mr-4" />
                  <button className="block text-left w-full text-sm md:text-base" onClick={handleUploadToDropbox}>
                      Dropbox
                  </button>
              </div>
              <div className='w-full pt-2'> {/* Ensure this div takes full width */}
                  {uploading && (
                      <div className="relative w-40 h-4 bg-gray-400 pt-2 rounded-full overflow-hidden">
                          <div
                              className="absolute left-0 top-0 bg-blue-500 h-full rounded-full"
                              style={{
                                  width: `${uploadProgress}%`,
                                  transition: 'width 2s ease-in-out',
                              }}
                          />
                          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">
                              {uploadProgress}%
                          </span>
                      </div>
                  )}
              </div>
          </li>
          <li className={`cursor-pointer p-4 bg-teal-500 hover:bg-teal-600 grid items-center transition-colors duration-300 ${uploading ? 'grid-rows-2' : 'grid-rows-1'}`} role="menuitem">
             <div className="flex items-center md:pl-4">
                <DiGoogleDrive className="hidden lg:block lg:text-3xl mr-2" />
                <button className="block text-left w-full text-sm md:text-base" onClick={handleUploadToGoogleDrive}>
                  Google Drive
                </button>
             </div>
            <div className="w-full pt-2">
              {googleUploading && (
                  <div className="relative w-40 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                          className="absolute left-0 top-0 bg-blue-500 h-full rounded-full"
                          style={{
                              width: `${googleUploadProgress}%`,
                              transition: 'width 2s ease-in-out',
                          }}
                      />
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">
                          {googleUploadProgress}%
                      </span>
                  </div>
              )}
          </div>
          </li>
        </ul>
        </div>
      }
    </div>
  );
};

export default DownloadOptions;
