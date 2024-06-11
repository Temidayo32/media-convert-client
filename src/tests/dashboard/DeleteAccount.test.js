import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { DeleteAccount } from '../../components';
import { getAuth, reauthenticateWithCredential, deleteUser, EmailAuthProvider } from 'firebase/auth';


/**
 * Test Suite for DeleteAccount Component
 *
 * 1. Deletes account successfully.
 * 2. Displays error on failed deletion.
 */


jest.mock('firebase/auth');

global.setImmediate = (callback) => setTimeout(callback, 0);

describe('DeleteAccount Component', () => {
    const mockCurrentUser = {
        email: 'testuser@example.com',
    };

    beforeEach(() => {
        getAuth.mockReturnValue({
            currentUser: mockCurrentUser,
        });

        // Mock reauthenticateWithCredential and deleteUser
        reauthenticateWithCredential.mockResolvedValue();
        deleteUser.mockResolvedValue();

        // Mock EmailAuthProvider.credential
        EmailAuthProvider.credential = jest.fn().mockReturnValue('mockCredential');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('deletes account successfully', async () => {
        render(<DeleteAccount />);

        // Fill out form fields
        const currentEmailInput = screen.getByLabelText(/Current Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        fireEvent.change(currentEmailInput, { target: { value: 'testuser@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Simulate form submission
        fireEvent.submit(screen.getByRole('button', { name: /DELETE ACCOUNT/i }));

        // Wait for the async operations to complete
        await waitFor(() => {
            expect(reauthenticateWithCredential).toHaveBeenCalledWith(mockCurrentUser, 'mockCredential');
            expect(deleteUser).toHaveBeenCalledWith(mockCurrentUser);
        });

        // Expect success message to be displayed
        expect(screen.getByText(/User account deleted successfully!/i)).toBeInTheDocument();
    });

    test('displays error on failed deletion', async () => {
        const errorMessage = 'An error occurred during account deletion';

        // Mock deleteUser to throw an error
        deleteUser.mockRejectedValueOnce(new Error(errorMessage));

        render(<DeleteAccount />);

        // Fill out form fields
        const currentEmailInput = screen.getByLabelText(/Current Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        fireEvent.change(currentEmailInput, { target: { value: 'testuser@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Simulate form submission
        fireEvent.submit(screen.getByRole('button', { name: /DELETE ACCOUNT/i }));

        // Wait for the async operations to complete
        await waitFor(() => {
            expect(reauthenticateWithCredential).toHaveBeenCalledWith(mockCurrentUser, 'mockCredential');
            expect(deleteUser).toHaveBeenCalledWith(mockCurrentUser);
        });

        // Expect error message to be displayed
        expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });
});
