import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { UploadOptions } from '../../components';
import { BrowserRouter as Router } from 'react-router-dom';
import { onSuccess } from '../../utils/uploadFiles';


/**
 * Test Suite for UploadOptions Component
 
 * 1. Render the component without crashing.
 * 2. Test the file upload functionality.
 * 3. Test the Dropbox selection functionality--should handle successful file uploads for Dropbox
 * 4. Test the Dropbox selection functionality--should handle successful file uploads for Dropbox
 * 5. Test the Google Drive selection functionality.
 */

jest.mock('react-dropbox-chooser', () => ({ success, children }) => (
  <div data-testid="mock-dropbox-chooser" onClick={() => success([{ link: 'dropbox-file-link' }])}>
    {children}
  </div>
));

global.setImmediate = (callback) => setTimeout(callback, 0);

console.error = jest.fn();
console.log = jest.fn();

describe('UploadOptions Component', () => {
  let setUploadedFiles, setOversizedFiles, setShowErrorMessages, setShowUploadForm;
  const defaultFormat = 'mp4';
  const defaultSettings = {};
  const emailVerified = true;
  const uploadedFiles = [];

  beforeEach(() => {
    setUploadedFiles = jest.fn();
    setOversizedFiles = jest.fn();
    setShowErrorMessages = jest.fn();
    setShowUploadForm = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock function calls after each test
  });

  test('renders correctly', () => {
    const handleFileUpload = jest.fn();
    const handleOpenPicker = jest.fn();
    const onSuccess = jest.fn();
    const onCancel = jest.fn();
    const handleFileSelected = jest.fn();

    const { getByText, getByTestId, asFragment } = render(
      <Router>
        <UploadOptions
          handleFileUpload={handleFileUpload}
          handleOpenPicker={handleOpenPicker}
          onSuccess={onSuccess}
          onCancel={onCancel}
          handleFileSelected={handleFileSelected}
        />
      </Router>
    );

    expect(getByText('From Device')).toBeInTheDocument();
    expect(getByTestId('mock-dropbox-chooser')).toBeInTheDocument();
    expect(getByText('From Google Drive')).toBeInTheDocument();

    // Snapshot test
    expect(asFragment()).toMatchSnapshot();
  });

  test('handles file upload', () => {
    const handleFileUpload = jest.fn();

    const { container, asFragment } = render(
      <Router>
        <UploadOptions handleFileUpload={handleFileUpload} />
      </Router>
    );

    const uploadInput = container.querySelector('#upload-file');
    fireEvent.change(uploadInput, {
      target: {
        files: [new File(['(⌐□_□)'], 'large_video.mp4', { type: 'video/mp4' })],
      },
    });

    expect(handleFileUpload).toHaveBeenCalled();

    // Snapshot test
    expect(asFragment()).toMatchSnapshot();
  });

  test('should handle successful file uploads for Dropbox', () => {
    const files = [{ name: 'file1', bytes: 500, link: 'dropbox-file-link' }];
    
    onSuccess(files, defaultFormat, defaultSettings, uploadedFiles, setUploadedFiles, emailVerified, setOversizedFiles, setShowErrorMessages, setShowUploadForm);

    expect(setUploadedFiles).toHaveBeenCalledWith([
      {
        source: 'dropbox',
        file: files[0],
        name: 'file1',
        fileLink: 'dropbox-file-link',
        size: '0.00 MB',
        format: 'mp4',
        jobId: expect.any(String),
        settings: {},
      },
    ]);

    expect(setOversizedFiles).toHaveBeenCalledWith([]);
    // expect(setShowErrorMessages).toHaveBeenCalledWith(false);
    expect(setShowUploadForm).toHaveBeenCalledWith(false);
  });

  test('should handle oversized files for Dropbox', () => {
    const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024;
    const files = [{ name: 'file1', bytes: MAX_FILE_SIZE + 1, link: 'dropbox-file-link' }];
    const emailVerified = false;
    
    onSuccess(files, defaultFormat, defaultSettings, uploadedFiles, setUploadedFiles, emailVerified, setOversizedFiles, setShowErrorMessages, setShowUploadForm);

    expect(setUploadedFiles).toHaveBeenCalledWith([]);
    expect(setOversizedFiles).toHaveBeenCalledWith([`File size of file1 exceeds the 1 GB limit.`]);
    expect(setShowErrorMessages).toHaveBeenCalledWith(true);
    expect(setShowUploadForm).toHaveBeenCalledWith(false);
  });

  test('handles Google Drive selection', () => {
    // Mock functions
    const handleOpenPicker = jest.fn();
    const onSuccess = jest.fn();
    const onCancel = jest.fn();
    const { getByText, asFragment } = render(
      <Router>
        <UploadOptions handleOpenPicker={handleOpenPicker} onSuccess={onSuccess} onCancel={onCancel} />
      </Router>
    );

    // Find the Google Drive link
    const googleDriveLink = getByText('From Google Drive');

    expect(googleDriveLink).toBeInTheDocument();
    fireEvent.click(googleDriveLink);
    expect(handleOpenPicker).toHaveBeenCalled();
    expect(handleOpenPicker).toHaveBeenCalledTimes(1);

    // Snapshot test
    expect(asFragment()).toMatchSnapshot();
  });
});
