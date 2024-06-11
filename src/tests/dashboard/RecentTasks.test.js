import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { RecentTasks } from '../../components'; // Adjust the import path based on your directory structure
import { getAuth } from 'firebase/auth';
import { getDocs } from 'firebase/firestore';
import { addHours } from 'date-fns';
import { act } from 'react';
import { handleRemoveTask } from '../../utils/removeTasks';


/**
 * Test Suite for RecentTasks Component
 *
 * 1. Renders RecentTasks component without crashing.
 * 2. Fetches and displays tasks.
 * 3. Filters tasks by status.
 * 4. Deletes a task.
 * 5. Displays expiration time for completed tasks.
 */

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('../../components/video/DownloadOptions', () => () => <div>DownloadOptions Mock</div>);
jest.mock('../../utils/removeTasks');

global.setImmediate = (callback) => setTimeout(callback, 0);

const mockUser = {
    uid: 'mockUserId',
    email: 'mockuser@example.com',
};

const mockTasks = [
    {
        jobId: '1',
        name: 'Sample Video',
        format: 'mp4',
        progress: 'completed',
        completedAt: new Date(),
        fileUrl: 'https://example.com/sample.mp4',
    },
    {
        jobId: '2',
        name: 'Another Video',
        format: 'avi',
        progress: 'processing',
        completedAt: null,
        fileUrl: '',
    },
];

describe('RecentTasks Component', () => {
    beforeEach(async () => {
        getAuth.mockReturnValue({ currentUser: mockUser });
    
        const getDocsMock = jest.fn((q) => {
            const taskSnapshots = mockTasks.map((task) => ({
                id: task.jobId,
                data: () => task,
            }));
            return Promise.resolve({ docs: taskSnapshots });
        });
    
        getDocs.mockImplementation(getDocsMock);
    
        await act(async () => {
            render(<RecentTasks />);
        });
    });
    

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders RecentTasks component without crashing', async () => {
        let asFragment
        await act(async () => {
            const {asFragment:  renderAsFragment} = render(<RecentTasks />);
            asFragment = renderAsFragment()
        });
        expect(screen.getAllByText(/Filter by status:/i)).toHaveLength(2);
        expect(asFragment).toMatchSnapshot();
    });

    test('fetches and displays tasks', async () => {
        await waitFor(() => expect(getDocs).toHaveBeenCalled());
        expect(screen.getByText(/Sample Video.mp4/i)).toBeInTheDocument();
        expect(screen.getByText(/Another Video.avi/i)).toBeInTheDocument();
    });

    test('filters tasks by status', async () => {
        await waitFor(() => expect(getDocs).toHaveBeenCalled());
        const filter = screen.getByTestId("filter label");
        fireEvent.change(filter, { target: { value: 'completed' } });
        expect(screen.queryByText(/Another Video.avi/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Sample Video.mp4/i)).toBeInTheDocument();
    });

    test('deletes a task', async () => {
        // Mock setTasks function
        const setTasks = jest.fn();
    
        // Wait for the component to finish rendering
        await waitFor(() => {});
    
        // Mock handleRemoveTask function
        handleRemoveTask.mockImplementation(async (user, jobId, setTasks) => {
            // Simulate task deletion by filtering out the task with the provided jobId
            setTasks(mockTasks.filter(task => task.jobId !== jobId));
        });
    
        // Get the delete buttons
        const deleteButtons = screen.getAllByTestId("delete-task-button");
    
        // Click the first delete button
        fireEvent.click(deleteButtons[0]);
    
        // Wait for the asynchronous operation triggered by clicking the delete button to complete
        await waitFor(() => {});
    
        // Check if handleRemoveTask has been called with the correct arguments
        // setTasks is called with an anonymous function, so we use expect.any(Function) here
        expect(handleRemoveTask).toHaveBeenCalledWith(mockUser, '1', expect.any(Function)); 
    
        // Check if the task is removed from the screen
        expect(screen.queryByText(/Sample Video.mp4/i)).not.toBeInTheDocument();
    });
    
    test('displays expiration time for completed tasks', async () => {
        await waitFor(() => expect(getDocs).toHaveBeenCalled());
    
        // Calculate the expected relative time
        const expirationTime = addHours(new Date(mockTasks[0].completedAt), 8);
        const expectedTextPattern = new RegExp(`in \\d+ hours`);
    
        // Find an element containing the expected relative time text
        const expirationElement = screen.getByText(expectedTextPattern);
    
        // Assert that the element exists
        expect(expirationElement).toBeInTheDocument();
    });
    
});