import React, {act} from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SignUpWithEmail } from '../../components';
import firebase from 'firebase/compat/app';

/**
 * Test Cases:
1. Renders the component correctly with email input, password input, confirm password input, and a sign-up button.
2. Displays error messages correctly when invalid input is provided (invalid email, invalid password, passwords mismatch).
3. Calls the signUpWithEmailAndPassword function correctly when the sign-up button is clicked and input validation passes.
4. Disables the sign-up button when the component is in the loading state or when there are validation errors.
 */

global.setImmediate = (callback) => setTimeout(callback, 0);

console.error = jest.fn();
console.log = jest.fn();

describe('SignUpWithEmail Component', () => {
  test('Renders the component correctly with email input, password input, confirm password input, and a sign-up button', () => {
    render(
      <MemoryRouter>
        <SignUpWithEmail />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByTestId('Password Set')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText(/SIGN UP/i)).toBeInTheDocument();
  });

  test('Displays error messages correctly when invalid input is provided', async () => {
    render(
      <MemoryRouter>
        <SignUpWithEmail />
      </MemoryRouter>
    );
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByTestId('Password Set');
    const confirmPasswordInput = screen.getByPlaceholderText(/Confirm Password/i);
    const signUpButton = screen.getByText(/SIGN UP/i);


    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'mismatch' } });
    fireEvent.click(signUpButton)

    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/Password must contain at least 8 characters/i)).toBeInTheDocument();
  });

  test('Calls the signUpWithEmailAndPassword function correctly when the sign-up button is clicked', async () => {
    const setUserCredentials = jest.fn();
    const closeSignUpAndShowSuccess = jest.fn();
    const createUserWithEmailAndPassword = jest.fn().mockResolvedValue({});
    jest.spyOn(firebase.auth(), 'createUserWithEmailAndPassword').mockImplementation(createUserWithEmailAndPassword);

    render(
      <MemoryRouter>
        <SignUpWithEmail setUserCredentials={setUserCredentials} closeSignUpAndShowSuccess={closeSignUpAndShowSuccess} />
      </MemoryRouter>
    );
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByTestId('Password Set');
    const confirmPasswordInput = screen.getByPlaceholderText(/Confirm Password/i);
    const signUpButton = screen.getByText(/SIGN UP/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword1!' } });
    fireEvent.click(signUpButton);

    await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'StrongPassword1!');
        expect(setUserCredentials).toHaveBeenCalled();
        expect(closeSignUpAndShowSuccess).toHaveBeenCalled();
      });
  });

  test('Disables the sign-up button when the component is in the loading state or when there are validation errors', async () => {
    render(
      <MemoryRouter>
        <SignUpWithEmail />
      </MemoryRouter>
    );
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByTestId('Password Set');
    const confirmPasswordInput = screen.getByPlaceholderText(/Confirm Password/i);
    const signUpButton = screen.getByText(/SIGN UP/i);

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'mismatch' } });
    fireEvent.click(signUpButton)

    expect(signUpButton).toBeDisabled();

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword1!' } });

    expect(signUpButton).not.toBeDisabled();
  });
});
