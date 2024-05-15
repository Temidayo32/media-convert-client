import React from 'react';
import { Link } from 'react-router-dom';
import { IoIosFolderOpen } from 'react-icons/io';
import { FaDropbox } from 'react-icons/fa';
import { DiGoogleDrive } from 'react-icons/di';
import OneDrivePicker from './OneDrivePicker';
import DropboxChooser from 'react-dropbox-chooser';

import { dropboxAppKey } from '../../config/key';

const UploadOptions = ({ handleFileUpload, handleOpenPicker, onSuccess, onCancel, handleFileSelected }) => {
  return (
    <div className="absolute text-2xl top-full left-0 w-full bg-teal-500 text-center text-white rounded-lg my-px shadow-lg">
      <ul>
        <label htmlFor="upload-file" className="cursor-pointer">
          <li className="p-4 pl-8 hover:bg-teal-600 flex items-center transition-colors duration-300">
            <input
              id="upload-file"
              type="file"
              className="hidden"
              accept="video/*"
              onChange={(e) => handleFileUpload(e)}
            />
            <IoIosFolderOpen className="text-2xl mr-4" />
            From Device
          </li>
        </label>
        <DropboxChooser
          appKey={dropboxAppKey}
          success={onSuccess}
          cancel={onCancel}
          multiselect={true}
        >
          <li className="p-4 pl-8 hover:bg-teal-600 flex items-center transition-colors duration-300">
            <FaDropbox className="text-2xl mr-4" />
            From Dropbox
          </li>
        </DropboxChooser>
        <Link
          className="p-4 pl-8 hover:bg-teal-600 flex items-center transition-colors duration-300"
          onClick={handleOpenPicker}
        >
          <DiGoogleDrive className="text-2xl mr-4" />
          From Google Drive
        </Link>
        <OneDrivePicker onSuccess={handleFileSelected} />
      </ul>
    </div>
  );
};

export default UploadOptions;
