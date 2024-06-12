import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PasswordReset from '../../components/home/PasswordReset';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { BrowserRouter as Router } from 'react-router-dom';


/**
 * Test Cases:
1. Renders the component correctly when the show prop is true, displaying the email input field and the reset password button.
2. Does not render the component when the show prop is false.
3. Submits the password reset request correctly.
4. Closes the modal when clicking outside of the reset password component.
 */

jest.mock('firebase/compat/app');
jest.mock('firebase/compat/auth');

global.setImmediate = (callback) => setTimeout(callback, 0);

console.error = jest.fn();
console.log = jest.fn();

describe('PasswordReset component', () => {
  beforeEach(() => {
    firebase.auth = jest.fn().mockReturnValue({
        sendPasswordResetEmail: jest.fn().mockResolvedValue(),
      });
  });

  const renderComponent = (props = {}) => {
    render(
        <Router>
            <PasswordReset {...props} />
        </Router>
    );
  };

  test('renders the component when show is true', () => {
    renderComponent({ show: true });
  
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /RESET PASSWORD/i })).toBeInTheDocument();
  });
  
  test('does not render the component when show is false', () => {
    renderComponent({ show: false });
  
    expect(screen.queryByText(/Reset Password/i)).not.toBeInTheDocument();
  });
  
  test('submits the password reset request', async () => {
    renderComponent({ show: true });
  
    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  
    const resetButton = screen.getByRole('button', { name: /RESET PASSWORD/i });
    fireEvent.click(resetButton);
  
    await waitFor(() => {
      expect(firebase.auth().sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
  
  test('closes the modal when clicking outside', () => {
    const handleClose = jest.fn();
    renderComponent({ show: true, onClose: handleClose });
  
    fireEvent.click(screen.getByTestId('closeReset'));
    
    expect(handleClose).toHaveBeenCalled();
  });
  
});
