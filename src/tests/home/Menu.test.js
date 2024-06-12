import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { Menu } from '../../components';
import { useData } from '../../DataContext';

/**
 *Test cases:

1. Renders the menu button correctly.
2. Shows the menu on hover and displays user information such as name, profile picture, and plan.
3. Navigates to the Recent Tasks and Dashboard pages when the respective links are clicked.
4. Handles logout functionality correctly by logging the user out when the logout button is clicked.
 */

jest.mock('firebase/auth');
jest.mock('../../DataContext');

global.setImmediate = (callback) => setTimeout(callback, 0);

console.error = jest.fn();
console.log = jest.fn();

describe('Menu component', () => {
  beforeEach(() => {
    useData.mockReturnValue({
      userCredentials: {
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'http://example.com/photo.jpg',
      },
    });

    getAuth.mockReturnValue({});
    signOut.mockResolvedValue();
  });

  test('renders the menu button', () => {
    render(
      <Router>
        <Menu />
      </Router>
    );

    const button = screen.getByTestId('options-menu');
    expect(button).toBeInTheDocument();
  });

  test('shows the menu on hover and displays user information', async () => {
    render(
      <Router>
        <Menu />
      </Router>
    );

    const button = screen.getByTestId('options-menu');

    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Free Plan')).toBeInTheDocument();
      expect(screen.getByAltText('Menu')).toBeInTheDocument();
    });
  });

  test('navigates to Recent Tasks and Dashboard on link click', async () => {
    render(
      <Router>
        <Menu />
      </Router>
    );

    const button = screen.getByTestId('options-menu');
    fireEvent.mouseEnter(button);

    const recentTasksLink = await screen.findByText(/Recent Tasks/i);
    const dashboardLink = await screen.findByText(/Go To Dashboard/i);

    expect(recentTasksLink).toBeInTheDocument();
    expect(dashboardLink).toBeInTheDocument();
  });

  test('handles logout correctly', async () => {
    render(
      <Router>
        <Menu />
      </Router>
    );

    const button = screen.getByTestId('options-menu');
    fireEvent.mouseEnter(button);

    const logoutButton = await screen.findByText(/Logout/i);

    fireEvent.click(logoutButton);

    await waitFor(() => expect(signOut).toHaveBeenCalled());
  });
});
