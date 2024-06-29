import React from 'react';
import { Link } from 'react-router-dom';

import { IoIosFolderOpen } from 'react-icons/io';
import { FaDropbox } from 'react-icons/fa';
import { DiGoogleDrive } from 'react-icons/di';
import DropboxChooser from 'react-dropbox-chooser';

import { dropboxAppKey } from '../../config/key';

const UploadOptions = ({ 
  handleFileUpload, 
  handleOpenPicker, 
  onSuccess, 
  onCancel,  
  uploadedFiles, 
  setUploadedFiles, 
  emailVerified, 
  setOversizedFiles, 
  setShowErrorMessages, 
  setShowUploadForm, 
  developerKey,
  defaultFormat,
  defaultSettings,
  mimeType,
  editImage
  }) => {
    
  return (
    <div className={`absolute ${editImage ? 'text-base': 'text-sm sm:text-base lg:text-xl xl:text-2xl'} top-full left-0 w-full bg-teal-500 text-center text-white rounded-lg my-px shadow-lg`}>
      <ul>
        <label htmlFor="upload-file" className="cursor-pointer">
          <li className={`p-4 ${editImage ? '' : 'pl-8'} hover:bg-teal-600 flex items-center transition-colors duration-300`}>
            <input
              id="upload-file"
              type="file"
              className="hidden"
              accept={mimeType}
              multiple='multiple'
              onChange={(e) => handleFileUpload(e, defaultFormat, defaultSettings, uploadedFiles, setUploadedFiles, emailVerified, setOversizedFiles, setShowErrorMessages, setShowUploadForm)}  
            />
            <IoIosFolderOpen className={`hidden sm:block ${editImage ? 'text-base mr-1': 'sm:text-lg lg:text-2xl mr-4'}`} />
            From Device
          </li>
        </label>
        <DropboxChooser
          appKey={dropboxAppKey}
          success={(files) => onSuccess(files, defaultFormat, defaultSettings, uploadedFiles, setUploadedFiles, emailVerified, setOversizedFiles, setShowErrorMessages, setShowUploadForm)}
          cancel={onCancel}
          multiselect={true}
        >
          <li className={`p-4 ${editImage ? '' : 'pl-8'} hover:bg-teal-600 flex items-center transition-colors duration-300 cursor-pointer`}>
            <FaDropbox className={`hidden sm:block ${editImage ? 'text-base mr-1': 'sm:text-lg lg:text-2xl mr-4'}`} />
            From Dropbox
          </li>
        </DropboxChooser>
        <Link
          className={`p-4 ${editImage ? '' : 'pl-8'} hover:bg-teal-600 flex items-center transition-colors duration-300 cursor-pointer`}
          onClick={() => handleOpenPicker(developerKey, uploadedFiles, setUploadedFiles, defaultFormat, defaultSettings, emailVerified, setOversizedFiles, setShowErrorMessages, setShowUploadForm, mimeType)}
        >
          <DiGoogleDrive className={`hidden sm:block ${editImage ? 'text-base mr-1': 'sm:text-lg lg:text-2xl mr-4'}`} />
          From Google Drive
        </Link>
        {/* <OneDrivePicker onSuccess={handleFileSelected} /> */}
      </ul>
    </div>
  );
};

export default UploadOptions;
