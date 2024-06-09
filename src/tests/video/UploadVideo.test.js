import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import { UploadVideo } from '../../components';
import { useData } from '../../DataContext';
import { BrowserRouter as Router } from 'react-router-dom';
import fetchMock from 'jest-fetch-mock';
import { act } from 'react';


/**
 * Test Suite for UploadVideo Component
 *
 * 1. Render the component without crashing.
 * 2. Handle the upload of a video file.
 * 3. Remove a video from the uploaded videos list.
 * 4. Handle the video conversion process correctly.
 * 5. Fetch conversion formats from conversions.json on mount.
 */


// Mock dependencies
jest.mock('axios');

jest.mock('socket.io-client', () => () => ({
  on: jest.fn(),
  off: jest.fn(),
}));


jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'test-uid' },
  }),
}));

jest.mock('../../utils/goggleAuth', () => ({
  handleGoogleAuth: jest.fn().mockResolvedValue('test-access-token'),
}));

jest.mock('gapi-script', () => ({
  gapi: {
    load: jest.fn(),
  },
}));

jest.mock('../../DataContext', () => ({
  useData: jest.fn(),
}));

global.setImmediate = (callback) => setTimeout(callback, 0);

// Define default settings
const defaultSettings = {
    selectedCodec: '',
    selectedFrameRate: '',
    selectedResolution: '',
    selectedScale: { width: '', height: '' },
    selectedCropFilter: '',
    selectedRotateFilter: '',
    deshakeChecked: false,
    selectedDenoise: '',
    selectedAspectRatio: '',
    selectedAudioCodec: '',
    volume: 1,
    noAudio: false,
  };

// Setup mock data context
const mockUseData = {
  uploadedVideos: [],
  setUploadedVideos: jest.fn(),
  setDownloadPageActive: jest.fn(),
  showSignUpOptions: false,
  setShowSignUpOptions: jest.fn(),
  emailVerified: false,
  idToken: 'test-id-token',
};

describe('UploadVideo Component', () => {
  beforeEach(() => {
    useData.mockReturnValue(mockUseData);
    axios.post.mockResolvedValue({ data: 'mock response' });
    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload form initially', async () => {
    const mockUseData = {
      uploadedVideos: [],
      setUploadedVideos: jest.fn(),
      setDownloadPageActive: jest.fn(),
      showSignUpOptions: false,
      setShowSignUpOptions: jest.fn(),
      emailVerified: false,
      idToken: null,
    };
  
    useData.mockReturnValue(mockUseData);
  
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        { format: 'MP4' },
        { format: 'AVI' },
        { format: 'MOV' },
      ]),
    });

    let asFragment
  
   await act(async () => {
    const { asFragment: renderAsFragment } = render(
        <Router>
          <UploadVideo defaultFormat="mp4" />
        </Router>
      );
      asFragment = renderAsFragment();
    });
  
    expect(screen.getByText(/Choose Files/i)).toBeInTheDocument();
    expect(asFragment).toMatchSnapshot();
  });

  test('handles file upload', async () => {
    const mockUseData = {
      uploadedVideos: [],
      setUploadedVideos: jest.fn(),
      setDownloadPageActive: jest.fn(),
      showSignUpOptions: false,
      setShowSignUpOptions: jest.fn(),
      emailVerified: false,
      idToken: null,
    };

    useData.mockReturnValue(mockUseData);

    // Mock the asynchronous fetch call for conversions.json
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        { format: 'MP4' },
        { format: 'AVI' },
        { format: 'MOV' },
      ]),
    });

    const { asFragment } = render(
      <Router>
        <UploadVideo defaultFormat="mp4" />
      </Router>
    );

    // Wait for the asynchronous fetching of conversions.json
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Simulate setting the state for a file upload
    mockUseData.uploadedVideos = [
      {
        source: 'local',
        file: new File(['(⌐□_□)'], 'video.mp4', { type: 'video/mp4' }),
        name: 'video.mp4',
        size: 1610612736,  // Example oversized file
        format: 'mp4',
        jobId: '12345_video',
        settings: { ...defaultSettings },
      },
    ];

    await waitFor(() => {
        expect(screen.getByText('video.mp4')).toBeInTheDocument();
        expect(screen.getByText('MP4')).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });
  });

  test('removes video from the list', async () => {
    const mockUseData = {
        uploadedVideos: [],
        setUploadedVideos: jest.fn(),
        setDownloadPageActive: jest.fn(),
        showSignUpOptions: false,
        setShowSignUpOptions: jest.fn(),
        emailVerified: false,
        idToken: null,
      };

    useData.mockReturnValue(mockUseData);

    // Mock the asynchronous fetch call for conversions.json
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        { format: 'MP4' },
        { format: 'AVI' },
        { format: 'MOV' },
      ]),
    });

    const { asFragment } = render(
      <Router>
        <UploadVideo defaultFormat="mp4" />
      </Router>
    );

    mockUseData.uploadedVideos = [
        {
          source: 'local',
          file: new File(['(⌐□_□)'], 'large_video.mp4', { type: 'video/mp4' }),
          name: 'large_video.mp4',
          size: 1610612736,  // Example oversized file
          format: 'mp4',
          jobId: '12345_large_video',
          settings: { ...defaultSettings },
        },
      ];

    await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButton);
    })

    await waitFor(() => {
      expect(mockUseData.setUploadedVideos).toHaveBeenCalledWith([]);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  test('handles video conversion', async () => {
    const mockUseData = {
      uploadedVideos: [],
      setUploadedVideos: jest.fn(),
      setDownloadPageActive: jest.fn(),
      showSignUpOptions: false,
      setShowSignUpOptions: jest.fn(),
      emailVerified: false,
      idToken: null,
    };
  
    useData.mockReturnValue(mockUseData);
  
    // Mock the asynchronous fetch call for conversions.json
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        { format: 'MP4' },
        { format: 'AVI' },
        { format: 'MOV' },
      ]),
    });
  
    // Render the component
    const { asFragment } = render(
      <Router>
        <UploadVideo defaultFormat="mp4" />
      </Router>
    );
  
    // Simulate an oversized file being uploaded
    mockUseData.uploadedVideos = [
      {
        source: 'local',
        file: new File(['(⌐□_□)'], 'large_video.mp4', { type: 'video/mp4' }),
        name: 'large_video.mp4',
        size: 1610612736,  // Example oversized file
        format: 'mp4',
        jobId: '12345_large_video',
        settings: { ...defaultSettings },
      },
    ];
  
    // Click the "Convert" button
    await waitFor(() => {
      const convert = screen.getByText('Convert')
      fireEvent.click(convert);
    })
  
    // Assertions
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/conversions.json');
      expect(axios.post).toHaveBeenCalled();
      expect(mockUseData.setDownloadPageActive).toHaveBeenCalledWith(true);
      expect(asFragment()).toMatchSnapshot();
    });
    global.fetch.mockRestore();
  });
  
  test('fetches conversions.json on mount', async () => {
    const mockData = [{ format: 'mp4' }, { format: 'avi' }];
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockData),
    });

    const { asFragment } = render(
      <Router>
        <UploadVideo defaultFormat="mp4" />
      </Router>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/conversions.json');
      expect(asFragment()).toMatchSnapshot();
    });

    global.fetch.mockRestore();
  });

//   test('handles google picker file selection', async () => {
//     const mockFiles = [
//       { mimeType: 'video/mp4', name: 'video1.mp4', sizeBytes: 500000000 },
//     ];
//     const pickerCallback = jest.fn();

//     gapi.load.mockImplementation((_, { callback }) => callback());
//     window.google = {
//       picker: {
//         PickerBuilder: jest.fn().mockImplementation(() => ({
//           setOrigin: jest.fn().mockReturnThis(),
//           enableFeature: jest.fn().mockReturnThis(),
//           setOAuthToken: jest.fn().mockReturnThis(),
//           setDeveloperKey: jest.fn().mockReturnThis(),
//           addView: jest.fn().mockReturnThis(),
//           setCallback: jest.fn().mockImplementation((cb) => {
//             pickerCallback.current = cb;
//             return { build: jest.fn().mockReturnThis(), setVisible: jest.fn() };
//           }),
//         })),
//         DocsUploadView: jest.fn(),
//         Feature: { SUPPORT_DRIVES: 'SUPPORT_DRIVES', NAV_HIDDEN: 'NAV_HIDDEN', MULTISELECT_ENABLED: 'MULTISELECT_ENABLED' },
//         Action: { CANCEL: 'CANCEL' },
//       },
//     };

//     const { getByText } = render(
//       <Router>
//         <UploadVideo defaultFormat="mp4" />
//       </Router>
//     );

//     fireEvent.click(getByText('Add More Files'));

//     pickerCallback.current({ docs: mockFiles });

//     await waitFor(() => {
//       expect(mockUseData.setUploadedVideos).toHaveBeenCalledWith(expect.any(Array));
//     });
//   });
});
