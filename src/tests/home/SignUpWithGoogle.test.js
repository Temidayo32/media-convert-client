import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { SignUpWithGoogle } from '../../components';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import '@testing-library/jest-dom/extend-expect';

global.setImmediate = (callback) => setTimeout(callback, 0);


console.error = jest.fn();
console.log = jest.fn();

// Mock DataContext and setIdToken
jest.mock('../../DataContext', () => ({
    useData: () => ({
      setIdToken: jest.fn()
    })
  }));

jest.mock('firebase/compat/app', () => {
    const auth = {
        signInWithPopup: jest.fn()
    };

    const firebaseApp = {
        initializeApp: jest.fn(),
        auth: () => auth,
    };

    return {
        __esModule: true,
        default: firebaseApp,
        auth: {
            GoogleAuthProvider: jest.fn()
        }
    };
});

jest.mock('firebase/compat/auth', () => ({
    getAuth: jest.fn()
}));

describe('SignUpWithGoogle Component', () => {
    beforeEach(() => {
        firebase.auth.GoogleAuthProvider = jest.fn().mockImplementation(() => ({}));
        firebase.auth().signInWithPopup.mockResolvedValue({
            credential: { idToken: 'mockIdToken' }
        });
    });

    test('Clicking the Google Sign-In Button', async () => {
        const setIdToken = jest.fn();
        const { getByText } = render(<SignUpWithGoogle setIdToken={setIdToken} />);
        const googleButton = getByText('Continue with Google');

        fireEvent.click(googleButton);

        await waitFor(() => {
            expect(firebase.auth().signInWithPopup).toHaveBeenCalled();
        });
    });
});
