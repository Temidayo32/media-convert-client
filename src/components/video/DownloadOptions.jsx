import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import { Dropbox } from 'dropbox';
import axios from 'axios';
import { clientId, dropboxAppKey } from '../../config/key';

import { IoIosArrowDropdownCircle } from 'react-icons/io';
import { IoIosFolderOpen } from 'react-icons/io';
import { FaDropbox } from 'react-icons/fa';
import { DiGoogleDrive } from 'react-icons/di';

const CLIENT_ID = clientId;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DROPBOX_CLIENT_ID =  dropboxAppKey;;
const BACKEND_URL = 'http://localhost:8000';
const DROPBOX_REDIRECT_URI = 'http://127.0.0.1:3000';

const DownloadOptions = ({ video, downloadUrl, progress }) => {
    const [googleToken, setGoogleToken] = useState(null);
    const [dropboxToken, setDropboxToken] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
      // Check if the user is redirected back with a Dropbox authorization code
      const params = new URLSearchParams(window.location.search);
      const dropboxCode = params.get('code');
      if (dropboxCode) {
        handleDropboxTokenExchange(dropboxCode);
      }
    }, []);
  
    const handleGoogleAuth = async () => {
        try {
          console.log('Attempting Google authentication...');
          const response = await gapi.auth2.authorize({
            client_id: CLIENT_ID,
            scope: SCOPES,
            response_type: 'code',
          });
          console.log('Google authentication response:', response);
          if (response && response.code) {
            const res = await axios.post(`${BACKEND_URL}/auth/google`, { code: response.code });
            console.log("Authentication successful");
            setGoogleToken(res.data);
          } else {
            console.error('Google authentication failed or did not return a code:', response);
            // Handle authentication failure (e.g., show error message to the user)
          }
        } catch (error) {
          console.error('Error during Google authentication:', error);
          // Handle error (e.g., show error message to the user)
        }
      };
      
  
    const handleDropboxAuth = () => {
      const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(DROPBOX_REDIRECT_URI)}`;
      window.location.href = authUrl;
    };
  
    const handleDropboxTokenExchange = async (code) => {
      const res = await axios.post(`${BACKEND_URL}/auth/dropbox`, { code });
      setDropboxToken(res.data);
    };
  
    const handleUploadToGoogleDrive = async () => {
      if (!googleToken) return handleGoogleAuth();
  
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;
  
      const fileMetadata = {
        name: `${video.name.split('.')[0]}.${video.format}`,
      };
  
      const base64Data = await fetch(downloadUrl).then(res => res.arrayBuffer()).then(buf => btoa(String.fromCharCode(...new Uint8Array(buf))));
  
      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        'Content-Type: ' + 'application/octet-stream' + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;
  
      const request = gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Authorization': `Bearer ${googleToken.access_token}`,
        },
        body: multipartRequestBody,
      });
  
      request.execute(file => {
        console.log('Uploaded to Google Drive:', file);
      });
    };
  
    const handleUploadToDropbox = async () => {
      if (!dropboxToken) return handleDropboxAuth();
  
      const dbx = new Dropbox({ accessToken: dropboxToken.access_token });
      const file = await fetch(downloadUrl).then(res => res.arrayBuffer());
  
      dbx.filesUpload({
        path: `/${video.name.split('.')[0]}.${video.format}`,
        contents: file,
      }).then(response => {
        console.log('Uploaded to Dropbox:', response);
      }).catch(error => {
        console.error('Error uploading to Dropbox:', error);
      });
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
          <li className="cursor-pointer p-4 pl-8 bg-teal-500 hover:bg-teal-600 flex items-center transition-colors duration-300" role="menuitem">
            <FaDropbox className="text-2xl mr-4" />
            <button className="block text-left w-full" onClick={handleUploadToDropbox}>
              Dropbox
            </button>
          </li>
          <li className="cursor-pointer p-4 pl-8 bg-teal-500 hover:bg-teal-600 flex items-center transition-colors duration-300" role="menuitem">
             <DiGoogleDrive className="text-2xl mr-4" />
            <button className="block text-left w-full" onClick={handleUploadToGoogleDrive}>
              Google Drive
            </button>
          </li>
        </ul>
        </div>
      }
    </div>
  );
};

export default DownloadOptions;
