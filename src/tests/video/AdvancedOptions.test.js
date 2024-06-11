import React from 'react';
import { render, screen, fireEvent, waitFor , getByRole } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AdvancedOptions } from '../../components';



/**
 * Test Suite for AdvancedOptions Component
 * 
 * 1. Check the display of file details (file name and file size).
 * 2. Verify the onClose function is called when the close icon is clicked.
 * 3. Check the onChange function is called with the correct value when a video codec is selected.
 * 4. Verify the onChange function is called with the correct value when a frame rate is selected.
 * 5. Ensure onChange is called with the correct value when custom resolution width is entered.
 * 6. Ensure onChange is called with the correct value when custom resolution height is entered.
 * 7. Verify the onChange function is called with the correct value when a crop filter is selected.
 * 8. Verify the onChange function is called with the correct value when a rotate filter is selected.
 * 9. Check the onChange function is called with the correct value when a denoise filter is selected.
 * 10. Ensure onChange is called with the correct value when deshake is checked.
 * 11. Verify the onChange function is called with the correct value when an audio codec is selected.
 * 12. Check the onChange function is called with the correct value when volume is adjusted.
 * 13. Ensure onChange is called with the correct value when no audio is checked.
 * 14. Verify resetData is called when the reset button is clicked.
 */


global.setImmediate = (callback) => setTimeout(callback, 0);
// Mock props
const mockOnClose = jest.fn();
const mockOnChange = jest.fn();
const mockResetData = jest.fn();
const mockFormData = {
    selectedCodec: '',
    selectedFrameRate: '',
    selectedAspectRatio: '',
    selectedResolution: '',
    selectedScale: { width: '', height: '' },
    selectedCropFilter: '',
    selectedRotateFilter: '',
    selectedDenoise: '',
    deshakeChecked: false,
    selectedAudioCodec: '',
    volume: 1,
    noAudio: false
};
const mockFileName = 'sample_video.mp4';
const mockFileSize = '50MB';

describe('AdvancedOptions Component', () => {
    beforeEach(() => {
        render(
            <AdvancedOptions
                onClose={mockOnClose}
                formData={mockFormData}
                onChange={mockOnChange}
                resetData={mockResetData}
                fileName={mockFileName}
                fileSize={mockFileSize}
            />
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
      });

    test('renders AdvancedOptions component with file details', () => {
        expect(screen.getByText(/Advanced Options \(Optional\)/i)).toBeInTheDocument();
        expect(screen.getByText(/File name: sample_video.mp4 \(50MB\)/i)).toBeInTheDocument();
    });

    test('calls onClose when close icon is clicked', () => {
        fireEvent.click(screen.getByTestId('closeIcon'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('calls onChange when a video codec is selected', () => {
        const codecElement = screen.getByText(/H.264/i);
        fireEvent.click(codecElement);
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ selectedCodec: 'libx264' }));
    });

    test('calls onChange when a frame rate is selected', () => {
        const frameRateElement = screen.getByText(/24 FPS/i);
        fireEvent.click(frameRateElement);
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ selectedFrameRate: '24' }));
    });

    test('calls onChange when custom resolution width is entered', () => {
        const widthInput = screen.getByLabelText('Width');
        fireEvent.change(widthInput, { target: { value: '1920' } });
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ selectedScale: { width: '1920', height: '' } }));
    });

    test('calls onChange when custom resolution height is entered', () => {
        const heightInput = screen.getByLabelText('Height');
        fireEvent.change(heightInput, { target: { value: '1080' } });
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ selectedScale: { width: '', height: '1080' } }));
    });

    test('calls onChange when crop filter is selected', async () => {
        // Click to open the dropdown
        fireEvent.click(screen.getByLabelText('Crop Filter'));
    
        // Wait for the dropdown options to appear
        await waitFor(() => {
            expect(screen.getByLabelText('Crop Filter')).toBeInTheDocument();
        });
    
        // Select the dropdown option directly by role
        const dropdown = screen.getByLabelText('Crop Filter');
        fireEvent.change(dropdown, { target: { value: '1280:720:0:0' } });
    
        // Verify that the onChange function is called with the correct value
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ selectedCropFilter: '1280:720:0:0' }));
    });

    test('calls onChange when rotate filter is selected', async () => {
        // Click to open the dropdown
        fireEvent.click(screen.getByLabelText('Rotate Filter'));
    
        // Wait for the dropdown options to appear
        await waitFor(() => {
            expect(screen.getByLabelText('Rotate Filter')).toBeInTheDocument();
        });
    
        // Select the dropdown option directly by role
        const dropdown = screen.getByLabelText('Rotate Filter');
        fireEvent.change(dropdown, { target: { value: 'PI/2' } });
    
        // Verify that the onChange function is called with the correct value
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ selectedRotateFilter: 'PI/2' }));
    });

    test('calls onChange when denoise filter is selected', () => {
        fireEvent.mouseDown(screen.getByLabelText('Denoise Filter'));
        fireEvent.click(screen.getByText('Light'));
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ selectedDenoise: 'hqdn3d=1.5:1.5:6.0:6.0' }));
    });

    test('calls onChange when deshake is checked', () => {
        const deshakeCheckbox = screen.getByLabelText('Deshake Video');
        fireEvent.click(deshakeCheckbox);
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ deshakeChecked: "on" }));
    });

    test('calls onChange when audio codec is selected', () => {
        const codecElement = screen.getByText(/AAC/i);
        fireEvent.click(codecElement);
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ selectedAudioCodec: 'aac' }));
    });

    test('calls onChange when volume is adjusted', () => {
        const volumeSlider = screen.getByLabelText('Volume');
        fireEvent.change(volumeSlider, { target: { value: '2' } });
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ volume: 2 }));
    });

    test('calls onChange when no audio is checked', () => {
        const noAudioCheckbox = screen.getByLabelText('No Audio');
        fireEvent.click(noAudioCheckbox);
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ noAudio: "on" }));
    });

    test('calls resetData when reset button is clicked', () => {
        fireEvent.click(screen.getByText(/Reset Options/i));
        expect(mockResetData).toHaveBeenCalled();
    });
});
