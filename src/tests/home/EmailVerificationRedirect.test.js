import React, {act} from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EmailVerificationRedirect } from '../../components';


// Mock Confetti component to avoid rendering actual confetti animation during tests
jest.mock('../../components/Confetti', () => () => <div data-testid="confetti"></div>);

global.setImmediate = (callback) => setTimeout(callback, 0);

console.error = jest.fn();
console.log = jest.fn();

describe('EmailVerificationRedirect Component', () => {
    test('displays verified email message when email parameter is present', async () => {
        const email = 'test@example.com';
        render(
          <MemoryRouter initialEntries={[`/verify-email?email=${encodeURIComponent(email)}`]}>
            <Routes>
              <Route path="/verify-email" element={<EmailVerificationRedirect />} />
            </Routes>
          </MemoryRouter>
        );
    
        expect(screen.getByText(`Email verified successfully for ${email}.`)).toBeInTheDocument();
        expect(screen.getByTestId('confetti')).toBeInTheDocument();
        expect(screen.getByText(/Go to Home/i)).toBeInTheDocument();
      });
    
      test('displays error message when email parameter is missing', () => {
        render(
          <MemoryRouter initialEntries={['/verify-email']}>
            <Routes>
              <Route path="/verify-email" element={<EmailVerificationRedirect />} />
            </Routes>
          </MemoryRouter>
        );
    
        expect(screen.getByText(/Error verifying email. Please try again./i)).toBeInTheDocument();
        expect(screen.getByTestId('confetti')).toBeInTheDocument();
        expect(screen.getByText(/Go to Home/i)).toBeInTheDocument();
      });
    
      test('confetti disappears after 5 seconds', async () => {
        jest.useFakeTimers();
    
        render(
          <MemoryRouter initialEntries={['/verify-email?email=test@example.com']}>
            <Routes>
              <Route path="/verify-email" element={<EmailVerificationRedirect />} />
            </Routes>
          </MemoryRouter>
        );
    
        expect(screen.getByTestId('confetti')).toBeInTheDocument();
    
        act(() => {
          jest.advanceTimersByTime(5000);
        });
    
        await waitFor(() => {
          expect(screen.queryByTestId('confetti')).not.toBeInTheDocument();
        });
    
        jest.useRealTimers();
      });
});
