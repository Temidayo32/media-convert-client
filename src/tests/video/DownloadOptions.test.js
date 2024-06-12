import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { DownloadOptions } from '../../components';
import { handleGoogleAuth, handleDropboxAuth } from '../../utils/goggleAuth';
import { Dropbox, DropboxAuth } from 'dropbox';


/**
 * Test Suite for DownloadOptions Component
 *
 * Steps:
 * 1. Render the component without crashing.
 * 2. Check the initial state of the download button (disabled if progress is not completed).
 * 3. Enable and interact with the download button when progress is completed.
 * 4. Show the dropdown menu when the button is clicked.
 * 5. Test the upload to Dropbox functionality.
 * 6. Test the upload to Google Drive functionality.
 */
console.error = jest.fn();
console.log = jest.fn();

// Mock the handleGoogleAuth utility function
jest.mock('../../utils/goggleAuth', () => ({
  handleGoogleAuth: jest.fn(),
  handleDropboxAuth: jest.fn(),
}));

// Mock Dropbox
jest.mock('dropbox', () => ({
  DropboxAuth: jest.fn(),
  Dropbox: jest.fn(),
}));

global.setImmediate = (callback) => setTimeout(callback, 0);

const mockVideo = {
  name: 'test_video.mp4',
  format: 'mp4',
};


const mockDownloadUrl = 'http://example.com/download.mp4';

HTMLAnchorElement.prototype.click = jest.fn();
global.URL.createObjectURL = jest.fn().mockReturnValue(mockDownloadUrl);


describe('DownloadOptions Component', () => {
  afterEach(() => {
    // Clear any active timers
    jest.clearAllMocks();
    
  });  

  // Test case 1: Render the component without crashing
  test('renders without crashing', () => {
    const { asFragment } = render(<DownloadOptions video={mockVideo} downloadUrl={mockDownloadUrl} progress="completed" />);
    expect(asFragment()).toMatchSnapshot();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  // Test case 2: Check the initial state of the download button (disabled if progress is not completed)
  test('disables the download button if progress is not completed', () => {
    const { asFragment } = render(<DownloadOptions video={mockVideo} downloadUrl={mockDownloadUrl} progress="in_progress" />);
    const downloadButton = screen.getByText('Download');
    expect(downloadButton).toBeDisabled();
    expect(asFragment()).toMatchSnapshot();
  });

  // Test case 3: Enable the download button when progress is completed
  test('enables the download button when progress is completed', () => {
    const { asFragment } =  render(<DownloadOptions video={mockVideo} downloadUrl={mockDownloadUrl} progress="completed" />);
    const downloadButton = screen.getByText('Download');
    expect(downloadButton).not.toBeDisabled();
    expect(asFragment()).toMatchSnapshot();
  });

  // Test case 4: Show the dropdown menu when the download button is clicked
  test('shows the dropdown menu when the download button is clicked', () => {
    const { asFragment } =  render(<DownloadOptions video={mockVideo} downloadUrl={mockDownloadUrl} progress="completed" />);
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    expect(screen.getByText('Device')).toBeInTheDocument();
    expect(screen.getByText('Dropbox')).toBeInTheDocument();
    expect(screen.getByText('Google Drive')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  test('handles download to device', () => {
    const { asFragment } =  render(<DownloadOptions video={mockVideo} downloadUrl={mockDownloadUrl} progress="completed" />);
    fireEvent.click(screen.getByText('Download'));
    const deviceButton = screen.getByText('Device');
    fireEvent.click(deviceButton);
  
    // Check if the anchor element is clicked with the correct parameters
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    expect(asFragment()).toMatchSnapshot();
  
    // Check if window.URL.createObjectURL is called with the correct parameters
    // expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockDownloadUrl);
  });

 // Test case 6: Handles upload to Dropbox
 test('handles upload to Dropbox', async () => {
  // Mock the handleDropboxAuth to return a resolved promise with a mock token
  handleDropboxAuth.mockResolvedValue({ result: { access_token: 'mock-dropbox-access-token' } });

  const { asFragment } =  render(<DownloadOptions video={mockVideo} downloadUrl={mockDownloadUrl} progress="completed" />);
  fireEvent.click(screen.getByText('Download'));
  const dropboxButton = screen.getByText('Dropbox');
  fireEvent.click(dropboxButton);

  await waitFor(() => {
    expect(handleDropboxAuth).toHaveBeenCalled();
    expect(asFragment()).toMatchSnapshot();
  });

  await waitFor(() => {
    // Check if Dropbox instance was created with the correct token
    expect(Dropbox).toHaveBeenCalledWith({ accessToken: 'mock-dropbox-access-token' });
    expect(asFragment()).toMatchSnapshot();
  });
});

  // Test case 7: Handles upload to Google Drive
  test('handles upload to Google Drive', async () => {
    handleGoogleAuth.mockResolvedValue('mock-google-access-token');

    const { asFragment } = render(<DownloadOptions video={mockVideo} downloadUrl={mockDownloadUrl} progress="completed" />);
    fireEvent.click(screen.getByText('Download'));
    const googleDriveButton = screen.getByText('Google Drive');
    fireEvent.click(googleDriveButton);

    await waitFor(() => {
      expect(handleGoogleAuth).toHaveBeenCalled();
      expect(asFragment()).toMatchSnapshot();
      // Check if upload to Google Drive is initiated
    });
  });
});
