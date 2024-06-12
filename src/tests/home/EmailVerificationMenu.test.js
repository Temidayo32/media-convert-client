import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { EmailVerificationMenu } from '../../components';
import { getAuth, sendEmailVerification } from 'firebase/auth';


global.setImmediate = (callback) => setTimeout(callback, 0);

console.error = jest.fn();
console.log = jest.fn();


jest.mock('firebase/auth', () => ({
  __esModule: true,
  getAuth: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

describe('EmailVerificationMenu Component', () => {
  const mockUser = {
    email: 'test@example.com',
  };

  beforeEach(() => {
    getAuth.mockReturnValue({
      currentUser: mockUser,
    });
    sendEmailVerification.mockResolvedValue(); // Mock sendEmailVerification to return a resolved promise
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders verification reminder when email is not verified', () => {
    render(
      <Router>
        <EmailVerificationMenu emailVerified={false} userCredentials={mockUser} />
      </Router>
    );

    expect(screen.getByText(/Please verify your email address. Your account is limited without verifying your email address./i)).toBeInTheDocument();
  });

  test('sends verification email when Re-send Verification Email button is clicked', async () => {
    render(
      <Router>
        <EmailVerificationMenu emailVerified={false} userCredentials={mockUser} />
      </Router>
    );

    const resendButton = screen.getByText(/Re-send Verification Email/i);
    await act(async () => {
      fireEvent.click(resendButton);
    });

    await waitFor(() => expect(sendEmailVerification).toHaveBeenCalledWith(mockUser, expect.any(Object)));
  });

  test('displays success message after resending verification email', async () => {
    render(
      <Router>
        <EmailVerificationMenu emailVerified={false} userCredentials={mockUser} />
      </Router>
    );

    const resendButton = screen.getByText(/Re-send Verification Email/i);
    await act(async () => {
      fireEvent.click(resendButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Verification email re-sent to test@example.com/i)).toBeInTheDocument();
    });
  });

  test('success message disappears after 2 seconds', async () => {
    jest.useFakeTimers();

    render(
      <Router>
        <EmailVerificationMenu emailVerified={false} userCredentials={mockUser} />
      </Router>
    );

    const resendButton = screen.getByText(/Re-send Verification Email/i);
    await act(async () => {
      fireEvent.click(resendButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Verification email re-sent to test@example.com/i)).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText(/Verification email re-sent to test@example.com/i)).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});
