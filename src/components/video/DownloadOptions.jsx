import React, { useState } from 'react';
import { gapi } from 'gapi-script';
import { Dropbox, DropboxAuth } from 'dropbox';
import { dropboxAppKey } from '../../config/key';
import { initGoogleAPI } from '../../utils/goggleAuth';
 
import { IoIosArrowDropdownCircle } from 'react-icons/io';
import { IoIosFolderOpen } from 'react-icons/io';
import { FaDropbox } from 'react-icons/fa';
import { DiGoogleDrive } from 'react-icons/di';



const DROPBOX_CLIENT_ID =  dropboxAppKey;
const CHUNK_SIZE = 8 * 1024 * 1024;
const STATE = 'random_string';
const DROPBOX_REDIRECT_URI = 'http://localhost:3000';

const DownloadOptions = ({ video, downloadUrl, progress }) => {
    const [googleToken, setGoogleToken] = useState(null);
    const [dropboxToken, setDropboxToken] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [googleUploading, setGoogleUploading] = useState(false);
      
  
    const handleDropboxAuth = async () => {
      const dbx = new DropboxAuth({ clientId: DROPBOX_CLIENT_ID });
    
      const authUrl = await dbx.getAuthenticationUrl(DROPBOX_REDIRECT_URI, STATE, 'code', 'offline', null, 'none', true);

      console.log(authUrl)
    
      const authWindow = window.open(authUrl, '_blank', 'width=500,height=700');
    
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          try {
            if (authWindow.closed) {
              clearInterval(interval);
              reject(new Error('Popup closed by user'));
            }
    
            const authUrl = new URL(authWindow.location);
            // console.log(authUrl)
            if (authUrl.origin === window.location.origin && authUrl.searchParams.get('code')) {
              const code = authUrl.searchParams.get('code');
              const state = authUrl.searchParams.get('state');
              authWindow.close();
              clearInterval(interval);
    
              if (code && state === STATE) {
                dbx.getAccessTokenFromCode(DROPBOX_REDIRECT_URI, code)
                  .then(token => resolve(token))
                  .catch(reject);
              } else {
                reject(new Error('Authorization failed'));
              }
            }
          } catch (error) {
            // Ignore cross-origin errors until the popup redirects to the redirect URI
          }
        }, 1000);
    
        authWindow.onbeforeunload = () => {
          clearInterval(interval);
          reject(new Error('Popup closed by user'));
        };
      });
    };
  
    const handleUploadToDropbox = async () => {
      try {
        setUploading(true);
        if (!dropboxToken) {
          const token = await handleDropboxAuth();
          setDropboxToken(token);
          if (!token) {
            throw new Error('Dropbox authentication failed');
          }
        }
        const dbx = new Dropbox({ accessToken: dropboxToken.result.access_token });
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
          commit: { path: `/${video.name.split('.')[0]}.${video.format}`, mode: 'add', autorename: true, mute: false },
        });
    
        console.log('Uploaded to Dropbox:', result);
      } catch (error) {
        console.error('Error uploading to Dropbox:', error);
      } finally {
        setUploading(false); // Set uploading state to false when upload is complete or encounters an error
      }
    };
  
    const handleDownloadToDevice = () => {
      if (progress === 'completed' && downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${video.name.split('.')[0]}.${video.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    const handleGoogleAuth = async () => {
      try { 
       
        console.log('Attempting Google authentication...');
        initGoogleAPI()
        const authResult = await gapi.auth2.getAuthInstance().signIn();
        if (authResult) {
          setGoogleToken(authResult.xc.access_token);
        } else {
          console.error('Google authentication failed or did not return a code:', authResult);
          // Handle authentication failure (show error message to the user)
        }
      } catch (error) {
        console.error('Error during Google authentication:', error);
        // Handle error ( show error message to the user)
      }
    };
    
    const handleUploadToGoogleDrive = async () => {
      // setGoogleUploading(true);
      if (!googleToken) {
        await handleGoogleAuth();
      }
    
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;
    
      const fileMetadata = {
        name: `${video.name.split('.')[0]}.${video.format}`,
      };

      console.log('it started...')
    
      try {
        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        // let uploadedBytes = 0

        // Convert ArrayBuffer to Base64
        const base64Data = await new Promise((resolve, reject) => {
          const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove "data:application/octet-stream;base64,"
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

        const uploadResponse = await gapi.client.request({
          path: '/upload/drive/v3/files',
          method: 'POST',
          params: { uploadType: 'multipart' },
          headers: {
            'Content-Type': `multipart/related; boundary=${boundary}`,
            'Authorization': `Bearer ${googleToken}`,
          },
          body: multipartRequestBody,
        });

        console.log('Uploaded to Google Drive:', uploadResponse.result);
      } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        // Handle error (e.g., show error message to the user)
      } finally {
        // setGoogleUploading(false); // Set uploading state to false when upload is complete or encounters an error
      }
    };

  return (
    <div className="relative inline-block text-left">
      <div
        className={`py-2 px-4 flex text-xl gap-6 items-center rounded-t-lg transition-colors duration-300 ${progress === 'completed' ? 'bg-teal-500 hover:bg-teal-600 shadow-2xl drop-shadow-2xl text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
        id="options-menu"
        aria-expanded="true"
        aria-haspopup="true"
        disabled={progress !== 'completed'} 
        onMouseEnter={() => setShowDropdown(true)}
        >
        <button
          type="button"
          disabled={progress !== 'completed'} 
          className={`${progress === 'completed' ? 'shadow-2xl drop-shadow-2xl text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
        >
          Download
        </button>
        <div
          className={`h-10 p-0 w-0.5 ${progress === 'completed' ? 'bg-white' : 'bg-gray-600 cursor-not-allowed'}`}></div>
        <IoIosArrowDropdownCircle
          className={`text-2xl ${progress === 'completed' ? 'text-white cursor-pointer' : 'text-gray-500 cursor-not-allowed'}`}
          />
      </div>

      {showDropdown && progress === 'completed' && 
        <div 
          className="absolute text-lg top-full left-0 w-full bg-teal-500 text-center text-white rounded-b-lg my-px shadow-lg z-30"
          onMouseLeave={() => setShowDropdown(false)}
          >
        <ul className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          <li className="cursor-pointer p-4 pl-8 bg-teal-500 hover:bg-teal-600 flex items-center transition-colors duration-300" role="menuitem">
          <IoIosFolderOpen className="text-2xl mr-4" />
            <button className="block text-left w-full" onClick={handleDownloadToDevice}>
              Device
            </button>
          </li>
          <li className="cursor-pointer p-4 pl-8 bg-teal-500 hover:bg-teal-600 flex justify-center items-center transition-colors duration-300" role="menuitem">
            <FaDropbox className="text-2xl mr-4" />
            <button className="block text-left w-full" onClick={handleUploadToDropbox}>
              Dropbox
            </button>
            <div className="block">
              {uploading && (
                <div className="relative w-48 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${uploadProgress}%`,
                      transition: 'width 4s ease-in-out',
                    }}
                  />
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm">
                    {uploadProgress}% Complete
                  </span>
                </div>
              )}
            </div> 
          </li>
          <li className="cursor-pointer p-4 pl-8 bg-teal-500 hover:bg-teal-600 flex items-center transition-colors duration-300" role="menuitem">
             <DiGoogleDrive className="text-2xl mr-4" />
            <button className="block text-left w-full" onClick={handleUploadToGoogleDrive}>
              Google Drive
            </button>
            <div className="block"> {/* Wrapper div to put googleUploading div on the next line */}
              {googleUploading && (
                  <div className="relative w-48 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                          className="absolute left-0 top-0 bg-blue-500 h-full rounded-full"
                          style={{
                              width: `${uploadProgress}%`,
                              transition: 'width 4s ease-in-out',
                          }}
                      />
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm">
                          {uploadProgress}% Complete
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
