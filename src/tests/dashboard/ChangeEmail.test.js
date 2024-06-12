import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ChangeEmail } from '../../components';
import { getAuth, reauthenticateWithCredential, updateEmail, EmailAuthProvider } from 'firebase/auth';


/**
 * Test Suite for Profile Component
 *
 * 1. Updates email successfully.
 */

jest.mock('firebase/auth');
console.error = jest.fn();
console.log = jest.fn();

global.setImmediate = (callback) => setTimeout(callback, 0);

describe('ChangeEmail Component', () => {
    const mockCurrentUser = {
        email: 'testuser@example.com',
    };

    beforeEach(() => {
        getAuth.mockReturnValue({
            currentUser: mockCurrentUser,
        });

        // Mock reauthenticateWithCredential and updateEmail
        reauthenticateWithCredential.mockResolvedValue();
        updateEmail.mockResolvedValue();

        // Mock EmailAuthProvider.credential
        EmailAuthProvider.credential = jest.fn().mockReturnValue('mockCredential');
    });

    afterEach(() => {
        jest.clearAllMocks();
      });

    test('updates email successfully', async () => {
        render(<ChangeEmail />);
        
        // Fill out form fields
        const currentEmailInput = screen.getByLabelText(/Current Email/i);
        const newEmailInput = screen.getByLabelText(/New Email/i);
        const passwordInput = screen.getByLabelText(/Retype Password/i);

        fireEvent.change(currentEmailInput, { target: { value: 'testuser@example.com' } });
        fireEvent.change(newEmailInput, { target: { value: 'newemail@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Simulate form submission
        fireEvent.submit(screen.getByRole('button', { name: /CHANGE EMAIL/i }));

        // Wait for the async operations to complete
        await waitFor(() => {
            expect(reauthenticateWithCredential).toHaveBeenCalledWith(mockCurrentUser, 'mockCredential');
            expect(updateEmail).toHaveBeenCalledWith(mockCurrentUser, 'newemail@example.com');
        });

        // Expect success message to be displayed
        expect(screen.getByText(/Email updated successfully!/i)).toBeInTheDocument();
        expect(screen.container).toMatchSnapshot();
    });
});