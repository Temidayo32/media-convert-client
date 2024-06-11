import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';
import { formatDistanceToNowStrict, addHours } from 'date-fns';
import { db } from '../../config/firebase_config';
import { doc, setDoc, getDocs, collection, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { MdDelete } from "react-icons/md";
import { GiEmptyMetalBucketHandle } from "react-icons/gi";
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DownloadOptions from '../video/DownloadOptions';
import { handleRemoveTask } from '../../utils/removeTasks';


// const socket = io('http://localhost:8000');

const colorMap = {
  processing: 'bg-orange-200',
  uploading: 'bg-blue-200',
  converting: 'bg-yellow-200',
  completed: 'bg-teal-200',
  pending: 'bg-gray-200',
  failed: 'bg-red-200',
};

const RecentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchTasks = async () => {
      if (user) {
        const userId = user.uid;
        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('userId', '==', userId));
    
        try {
          const tasksSnapshot = await getDocs(q);
          const tasksData = tasksSnapshot.docs.map((doc) => ({
            jobId: doc.id, // Use the document ID as the jobId
            ...doc.data(),
          }));
    
          setTasks(tasksData);
          console.log(tasks);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      }
    };
    
  
    fetchTasks();
  }, [user]);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTasks((prevTasks) => {
        return prevTasks.map((task) => {
          if (task.progress === 'completed' && task.completedAt) {
            const expirationTime = addHours(new Date(task.completedAt), 8);
            const timeRemaining = expirationTime - new Date();
            return { ...task, timeRemaining };
          }
          return task;
        });
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((task) => task.progress === filter);

  const formatTimeRemaining = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  };

  return (
        <div className="container flex items-center flex-col mx-auto w-full h-screen bg-gray-100">
            <div className="relative flex items-center justify-center p-8">
            <InputLabel id="filter-label" htmlFor="filter" className="mr-2 text-gray-500">Filter by status:</InputLabel>
              <FormControl>
                <Select
                  id="filter"
                  value={filter}
                  onChange={handleFilterChange}
                  className="bg-white border border-gray-300 hover:border-gray-400 w-48 px-4 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-gray-800"
                  style={{ borderRadius: '0' }}
                  aria-labelledby="filter-label"
                  inputProps={{ "data-testid": "filter label" }}
                >
                        <MenuItem value="all">All</MenuItem>
                        {Object.keys(colorMap).map((status) => (
                            <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>
                        ))}
                        </Select>
                    </FormControl>
            </div>
            <div className="h-screen overflow-y-scroll w-5/6 scroll-smooth overflow-hidden hide-scrollbar">
                <ul>
                    {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-gray-500 mt-8">
                        <GiEmptyMetalBucketHandle  className='size-72 transform rotate-45'/>
                        <p>No tasks found for the selected status.</p>
                    </div>
                    ): (filteredTasks.map((task) => (
                    <li key={task.jobId} className={`flex justify-between items-center m-8 h-28 border rounded py-4 px-4 pb-2 ${colorMap[task.progress]}`}>
                    <div className='flex w-5/12'>
                        <div className='flex flex-col w-5/12'>
                        <span className="text-teal-800 text-lg font-semibold">{task.name}.{task.format}</span>
                        </div>
                    </div>
                    <div className='flex justify-end items-center gap-12 w-7/12'>
                        {task.progress === 'completed' && task.completedAt && (
                        <div className="text-red-600 mt-2 flex items-center flex-col">
                            <p className='text-xl'>
                            {formatTimeRemaining(Math.max(0, Math.floor(task.timeRemaining / 1000)))}
                            </p>
                            <p className='text-sm'>
                            Expires {formatDistanceToNowStrict(addHours(new Date(task.completedAt), 8), { addSuffix: true })}
                            </p>
                        </div>
                        )}
                        <DownloadOptions
                          video={task}
                          downloadUrl={task.fileUrl}
                          progress={task.progress}
                        />
                        <button title="Delete" onClick={() => handleRemoveTask(user, task.jobId, setTasks)} data-testid="delete-task-button">
                        <MdDelete className="text-2xl text-gray-500 hover:text-red-600 transform hover:scale-110 transition transition-colors duration-300" />
                        </button>
                    </div>
                    </li>
                )))}
                </ul>
            </div>
         <p className='text-gray-400 ml-2 my-8'>Converted files are automatically deleted after 8 hours to protect your privacy. Please download your files before they are deleted</p>
    </div>
  );
};

export default RecentTasks;
