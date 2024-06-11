import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { LoginWithEmail } from '../../components';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock firebase
jest.mock('firebase/compat/app');
jest.mock('firebase/compat/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn()
}));

global.setImmediate = (callback) => setTimeout(callback, 0);

describe('LoginWithEmail Component', () => {
  beforeEach(() => {
    firebase.auth = jest.fn().mockReturnValue({
      signInWithEmailAndPassword: jest.fn()
    });
  });

  test('renders login form', () => {
    render(
        <Router>
            <LoginWithEmail onForgotPasswordClick={jest.fn()} />
        </Router>
    );
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot your password\?/i)).toBeInTheDocument();
  });

  test('handles login with correct credentials', async () => {
    const signInWithEmailAndPassword = jest.fn().mockResolvedValue({
      user: { email: 'test@example.com' }
    });
    firebase.auth().signInWithEmailAndPassword = signInWithEmailAndPassword;

    render(
        <Router>
            <LoginWithEmail onForgotPasswordClick={jest.fn()} />
        </Router>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByText(/log in/i));

    // Wait for the loading state to set in
    await waitFor(() => expect(screen.getByRole('button')).toBeDisabled());
    // expect(screen.getByRole('button')).toContainElement(screen.getByRole('img'));

    await waitFor(() => expect(signInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password'));
    await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());
  });

  test('displays error message with incorrect credentials', async () => {
    const error = new Error('Invalid credentials');
    const signInWithEmailAndPassword = jest.fn().mockRejectedValue(error);
    firebase.auth().signInWithEmailAndPassword = signInWithEmailAndPassword;

    render(
        <Router>
            <LoginWithEmail onForgotPasswordClick={jest.fn()} />
        </Router>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText(/log in/i));

    await waitFor(() => expect(signInWithEmailAndPassword).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword'));
    await waitFor(() => expect(screen.getByText(/incorrect username or password/i)).toBeInTheDocument());
  });

  test('calls onForgotPasswordClick when "Forgot Your Password?" link is clicked', () => {
    const onForgotPasswordClick = jest.fn();
    render(
        <Router>
            <LoginWithEmail onForgotPasswordClick={onForgotPasswordClick} />
        </Router>
    );

    fireEvent.click(screen.getByText(/forgot your password\?/i));
    expect(onForgotPasswordClick).toHaveBeenCalled();
  });
});
