import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Profile } from '../../components';
import { useData } from '../../DataContext';
import { getAuth, updateProfile } from 'firebase/auth';
import { getStorage, ref } from 'firebase/storage';


/**
 * Test Suite for Profile Component
 *
 * 1. Renders Profile component without crashing.
 * 2. Updates profile information.
 */


jest.mock('../../DataContext');
jest.mock('firebase/auth');
jest.mock('firebase/storage');

global.setImmediate = (callback) => setTimeout(callback, 0);

describe('Profile Component', () => {
    const mockUserCredentials = {
        email: 'testuser@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
    };

    beforeEach(() => {
        useData.mockReturnValue({ userCredentials: mockUserCredentials });
        getAuth.mockReturnValue({ currentUser: { uid: 'mockUserId' } });
        getStorage.mockReturnValue({});
        updateProfile.mockResolvedValue();
        ref.mockReturnValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders Profile component without crashing', async () => {
        await act(async () => {
            render(<Profile />);
        });

        expect(screen.getByText(/User Profile/i)).toBeInTheDocument();
        expect(screen.getByText(/testuser@example.com/i)).toBeInTheDocument();

        // Take a snapshot of the rendered component
        expect(screen.container).toMatchSnapshot();
    });

    test('updates profile information', async () => {
        await act(async () => {
            render(<Profile />);
        });

        const firstNameInput = screen.getByPlaceholderText(/First Name/i);
        const lastNameInput = screen.getByPlaceholderText(/Last Name/i);
        const updateButton = screen.getByText(/Update Profile/i);

        fireEvent.change(firstNameInput, { target: { value: 'NewFirst' } });
        fireEvent.change(lastNameInput, { target: { value: 'NewLast' } });
        fireEvent.click(updateButton);

        await waitFor(() => expect(updateProfile).toHaveBeenCalledWith(getAuth().currentUser, {
            displayName: 'NewFirst NewLast',
            photoURL: 'https://example.com/photo.jpg',
        }));

        expect(screen.getByText(/Profile updated successfully!/i)).toBeInTheDocument();

        // Take a snapshot of the updated component
        expect(screen.container).toMatchSnapshot();
    });
});
