import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { AccountSuccess } from '../../components';

jest.mock('../../components/Confetti', () => () => <div>Confetti</div>);


global.setImmediate = (callback) => setTimeout(callback, 0);

describe('AccountSuccess Component', () => {
    const mockOpenEmailVerification = jest.fn();

    test('renders AccountSuccess component and displays messages and icons', () => {
        render(
            <Router>
                <AccountSuccess openEmailVerification={mockOpenEmailVerification} />
            </Router>
        );
        expect(screen.getByText(/Account Created!/i)).toBeInTheDocument();
        expect(screen.getByText(/Thank you for signing up to Media Convert, you are the best!/i)).toBeInTheDocument();
        expect(screen.getByText(/CONTINUE FOR FREE/i)).toBeInTheDocument();
    });

    test('calls openEmailVerification when the continue button is clicked', () => {
        render(
            <Router>
                <AccountSuccess openEmailVerification={mockOpenEmailVerification} />
            </Router>
        );

        const continueButton = screen.getByText(/CONTINUE FOR FREE/i);
        fireEvent.click(continueButton);

        // Expect the openEmailVerification function to be called
        expect(mockOpenEmailVerification).toHaveBeenCalled();
    });
});
