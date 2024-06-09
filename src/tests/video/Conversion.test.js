import React from 'react';
import 'regenerator-runtime/runtime';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Conversion } from '../../components';
import { useData } from '../../DataContext';
import { getAuth } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';

// Mocking firebase/auth
jest.mock('firebase/auth');

// Mocking firebase/firestore
jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore');
  return {
    ...originalModule,
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    onSnapshot: jest.fn(),
  };
});

// Mocking socket.io-client
jest.mock('socket.io-client', () => () => ({
  on: jest.fn(),
  off: jest.fn(),
}));

// Mocking DataContext
jest.mock('../../DataContext', () => ({
  useData: jest.fn(),
}));

const mockUseData = {
  uploadedVideos: [
    {
      name: 'test_video.mp4',
      jobId: '1',
      size: '10MB',
      format: 'mp4',
      settings: {},
    },
  ],
  setUploadedVideos: jest.fn(),
};

const mockAuth = {
  currentUser: { uid: '123' },
};

describe('Conversion Component', () => {
  beforeEach(() => {
    useData.mockReturnValue(mockUseData);
    getAuth.mockReturnValue(mockAuth);

    // Mock Firestore onSnapshot to return an unsubscribe function and mock the snapshot
    onSnapshot.mockImplementation((query, callback) => {
      const snapshot = {
        docs: [
          {
            id: '1',
            data: () => ({ progress: 'completed', fileUrl: 'http://example.com/download.mp4' }),
          },
        ],
        docChanges: () => [{ type: 'added', doc: { id: '1', data: () => ({ progress: 'completed', fileUrl: 'http://example.com/download.mp4' }) } }],
      };
      callback(snapshot);
      return jest.fn(); // Unsubscribe function
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { asFragment } = render(<Conversion />);
    expect(screen.getByText(/Converted files are automatically deleted/i)).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  test('displays uploaded videos', () => {
    const { asFragment } =  render(<Conversion />);
    expect(screen.getByText('test_video.mp4')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  test('handles remove video action', () => {
    const { asFragment } =  render(<Conversion />);
    fireEvent.click(screen.getByTitle('Delete'));
    expect(mockUseData.setUploadedVideos).toHaveBeenCalled();
    expect(asFragment()).toMatchSnapshot();
  });

  test('shows completed progress for uploaded videos', () => {
    useData.mockReturnValue({
      ...mockUseData,
      uploadedVideos: [
        {
          ...mockUseData.uploadedVideos[0],
          progress: 'completed',
          fileUrl: 'http://example.com/download.mp4',
        },
      ],
    });

    const { asFragment } =  render(<Conversion />);
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
