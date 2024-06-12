import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ChangePassword } from '../../components';
import { getAuth, reauthenticateWithCredential, updatePassword, EmailAuthProvider } from 'firebase/auth';
import { useData } from '../../DataContext';


/**
 * Test Suite for ChangePassword Component
 *
 * 1. Updates password successfully:
 * 2. Displays error when email is not verified:
 */


jest.mock('firebase/auth');
jest.mock('../../DataContext');
console.error = jest.fn();
console.log = jest.fn();

global.setImmediate = (callback) => setTimeout(callback, 0);

describe('ChangePassword Component', () => {
    const mockCurrentUser = {
        email: 'testuser@example.com',
    };

    beforeEach(() => {
        getAuth.mockReturnValue({
            currentUser: mockCurrentUser,
        });

        // Mock reauthenticateWithCredential and updatePassword
        reauthenticateWithCredential.mockResolvedValue();
        updatePassword.mockResolvedValue();

        // Mock EmailAuthProvider.credential
        EmailAuthProvider.credential = jest.fn().mockReturnValue('mockCredential');

        // Mock useData
        useData.mockReturnValue({
            emailVerified: true,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('updates password successfully', async () => {
        render(<ChangePassword />);
        
        // Fill out form fields
        const currentEmailInput = screen.getByLabelText(/Current Email/i);
        const currentPasswordInput = screen.getByLabelText(/Current Password/i);
        const newPasswordInput = screen.getByLabelText(/New Password/i);

        fireEvent.change(currentEmailInput, { target: { value: 'testuser@example.com' } });
        fireEvent.change(currentPasswordInput, { target: { value: 'password123' } });
        fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });

        // Simulate form submission
        fireEvent.submit(screen.getByRole('button', { name: /CHANGE PASSWORD/i }));

        // Wait for the async operations to complete
        await waitFor(() => {
            expect(reauthenticateWithCredential).toHaveBeenCalledWith(mockCurrentUser, 'mockCredential');
            expect(updatePassword).toHaveBeenCalledWith(mockCurrentUser, 'newpassword123');
        });

        // Expect success message to be displayed
        expect(screen.getByText(/Password updated successfully!/i)).toBeInTheDocument();
    });

    test('displays error when email is not verified', () => {
        // Mock useData to return emailVerified as false
        useData.mockReturnValue({
            emailVerified: false,
        });

        render(<ChangePassword />);

        // Expect the verification message to be displayed
        expect(screen.getByText(/Please verify your email to access this feature./i)).toBeInTheDocument();
    });
});
