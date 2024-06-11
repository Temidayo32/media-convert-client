import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { Card } from '../../components';

global.setImmediate = (callback) => setTimeout(callback, 0);

describe('Card Component', () => {
    const mockProps = {
        format: 'MP4',
        icon: 'https://example.com/icon.png',
        description: 'Convert your videos to MP4 format quickly and easily.',
    };

    test('renders Card component with correct props', () => {
        render(
            <Router>
                <Card {...mockProps} />
            </Router>
        );

        // Check for format and description
        expect(screen.getByText(/MP4 Converter/i)).toBeInTheDocument();
        expect(screen.getByText(/Convert your videos to MP4 format quickly and easily./i)).toBeInTheDocument();

        // Check for icon
        const icon = screen.getByAltText(/MP4 Icon/i);
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('src', mockProps.icon);

        // Check for the start link
        const startLink = screen.getByText(/START/i);
        expect(startLink).toBeInTheDocument();
        expect(startLink.closest('a')).toHaveAttribute('href', '/video-converter/mp4');
    });

    test('contains a link that navigates to the correct URL', () => {
        render(
            <Router>
                <Card {...mockProps} />
            </Router>
        );

        const startLink = screen.getByText(/START/i);
        expect(startLink.closest('a')).toHaveAttribute('href', '/video-converter/mp4');
    });
});
