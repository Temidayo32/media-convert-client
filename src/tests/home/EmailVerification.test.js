import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { EmailVerification } from '../../components';
import { getAuth, sendEmailVerification } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
    __esModule: true,
    getAuth: jest.fn(),
    sendEmailVerification: jest.fn(),
}));

global.setImmediate = (callback) => setTimeout(callback, 0);

describe('EmailVerification Component', () => {
    const mockUser = {
        email: 'test@example.com',
    };

    beforeEach(() => {
        getAuth.mockReturnValue({
            currentUser: mockUser,
        });
        sendEmailVerification.mockResolvedValue();
    });

    test('renders verification email prompt with correct email', () => {
        act(() => {
            render(
                <Router>
                    <EmailVerification />
                </Router>
            );
        })

        // expect(screen.getByText(/Verify your Email/i)).toBeInTheDocument();
        expect(screen.getByText(/Please click the button below to verify your email address/i)).toBeInTheDocument();
    });

    test('sends verification email when Verify Email button is clicked', async () => {
        await act(async () => {
            render(
                <Router>
                    <EmailVerification />
                </Router>
            );
        })
        const verifyButton = screen.getByText(/VERIFY EMAIL/i);
        await act(async () => {
            fireEvent.click(verifyButton);
        });
        expect(sendEmailVerification).toHaveBeenCalled();
    });

    test('renders check email inbox prompt after verification email is sent', async () => {
        act(() => {
            render(
                <Router>
                    <EmailVerification />
                </Router>
            );
        })

        const verifyButton = screen.getByText(/VERIFY EMAIL/i);
        await act(async () => {
            fireEvent.click(verifyButton);
        });
        await waitFor(() => {
            expect(screen.getByText(/Check your Email Inbox now/i)).toBeInTheDocument();
            expect(screen.getByText(/We've sent you a verification to your email address/i)).toBeInTheDocument();
        });
    });

    test('resends verification email when Re-send verification email button is clicked', async () => {
        await act(async () => {
            render(
                <Router>
                    <EmailVerification />
                </Router>
            );
        })

        // First click the verify email button to get into the state where resend is available
        const verifyButton = screen.getByText(/VERIFY EMAIL/i);
        await act(async () => {
            fireEvent.click(verifyButton);
        });
        // Wait for the state to change and the "Check your Email Inbox now" message to appear
        await waitFor(() => {
            expect(screen.getByText(/Check your Email Inbox now/i)).toBeInTheDocument();
        });

        // Now find and click the resend button
        const resendButton = screen.getByText(/Re-send verification email/i);
        await act(async () => {
            fireEvent.click(resendButton);
        });

        await waitFor(() => expect(sendEmailVerification).toHaveBeenCalledWith(mockUser, expect.any(Object)));
    });
});
