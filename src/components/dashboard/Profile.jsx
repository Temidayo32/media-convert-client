import React, { useState, useEffect } from 'react';
import { useData } from '../../DataContext';
import { getAuth, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase_config';

import { FaRegEdit } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";

const Profile = () => {
    const { userCredentials } = useData();
    const auth = getAuth();
    // const storage = getStorage(); 
    const [displayName, setDisplayName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [prevPhotoURL, setPrevPhotoURL] = useState('');
    const [prevDisplayName, setPrevDisplayName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userCredentials) {
            const { displayName: storedDisplayName, photoURL: storedPhotoURL, email } = userCredentials;

            // Set displayName
            const username = email.split('@')[0];
            const newDisplayName = storedDisplayName || (username.charAt(0).toUpperCase() + username.slice(1));
            setDisplayName(newDisplayName);

            // Set first and last name
            const nameParts = newDisplayName.split(' ');
            setFirstName(nameParts[0]);
            setLastName(nameParts.slice(1).join(' '));

            // Set photoURL
            const newPhotoURL = storedPhotoURL || localStorage.getItem('photoURL') || `https://api.dicebear.com/8.x/micah/svg?backgroundColor=ffd4b2,ffc9a3,ffb84c&backgroundType=gradientLinear,solid`;
            setPhotoURL(newPhotoURL);
        }
    }, [userCredentials]);

    useEffect(() => {
        const timeoutDuration = 3000;
        const messageTimeout = setTimeout(() => {
            setMessage('');
            setIsLoading(false)
        }, timeoutDuration);
        
        const errorTimeout = setTimeout(() => {
            setError('');
        }, timeoutDuration);
        
        return () => {
            clearTimeout(messageTimeout);
            clearTimeout(errorTimeout);
        };
    }, [message, error]);


    const handleUpdateProfile = (e) => {
        e.preventDefault();
        const updatedDisplayName = `${firstName} ${lastName}`.trim();
        if (error === 'Image dimensions should not exceed 1000x1000 pixels.') {
            setError('Please upload an image with dimensions not exceeding 1000x1000 pixels.');
            return;
        }
        if (photoURL === prevPhotoURL && updatedDisplayName === prevDisplayName) {
            setError('No changes to update.');
            return;
        }
        updateProfile(auth.currentUser, {
            displayName: updatedDisplayName,
            photoURL
        }).then(() => {
            localStorage.setItem('photoURL', photoURL);
            setMessage('Profile updated successfully!');
            setPrevPhotoURL(photoURL);
            setPrevDisplayName(updatedDisplayName);
        }).catch((error) => {
                setError(`An error occurred: ${error.message}`);
        });
    };

    const handlePhotoChange = (e) => {
        setIsLoading(true);
        const file = e.target.files[0];
        console.log('Selected file:', file);
    
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              console.log('Image dimensions:', img.width, 'x', img.height);
    
              if (img.width <= 1000 && img.height <= 1000) {
                const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
                uploadBytes(storageRef, file).then((snapshot) => {
                  getDownloadURL(snapshot.ref).then((url) => {
                    setPhotoURL(url);
                    console.log('Photo URL:', url);
                  });
                }).catch((error) => {
                  setError(`An error occurred while uploading the image: ${error.message}`);
                });
              } else {
                setError('Image dimensions should not exceed 1000x1000 pixels.');
              }
            };
          };
          reader.readAsDataURL(file);
        }
      };
    

    if (!userCredentials) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    const email = userCredentials.email;

    return (
        <div className="flex justify-center h-screen bg-gray-100">
            <div className="mt-8 items-center justify-center text-center">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 text-center">User Profile</h1>
                <p className="text-center w-4/5 sm:w-full text-xs md:text-sm lg:text-base mb-6 text-gray-600">Welcome to your user dashboard. Thanks for using Convert Quickly.</p>
                <form onSubmit={handleUpdateProfile}>
                    <div className="flex flex-col items-center mb-6 relative">
                        <div className="relative group">
                            {isLoading ? (<CgSpinner className="animate-spin mr-2 size-20 md:size-28" data-testid='spinner' />): (
                                <div>
                                    <img
                                        src={photoURL}
                                        alt="Profile"
                                        className="w-16 h-16 md:w-24 md:h-24 rounded-full mb-4"
                                        onLoad={() => setIsLoading(false)}
                                        onError={() => setIsLoading(false)} // Set loading state to false when image is loaded
                                    />
                                    <FaRegEdit className="absolute bg-white rounded-full p-1.5 bottom-2 right-0 w-8 h-8 text-gray-500 cursor-pointer opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        data-testid='Profile Picture'
                                        onChange={handlePhotoChange}
                                        className="absolute bottom-0 right-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            )}     
                        </div>
                        <p className="text-xs md:text-sm lg:text-base text-gray-500">{email}</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center flex-col sm:flex-row gap-4 mb-4">
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First Name"
                                className="p-2 border text-center border-gray-300 text-xs md:text-sm lg:text-base rounded-full w-3/5 sm:w-full"
                            />
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last Name"
                                className="p-2 border border-gray-300 text-xs md:text-sm lg:text-base text-center rounded-full w-3/5 sm:w-full"
                            />
                        </div>
                    </div>
                    <div className="text-center mt-12">
                        <button type="submit" className="bg-teal-800 hover:bg-teal-500 w-3/5 sm:w-full transition-transform duration-300 hover:scale-105 transform text-white p-2 text-xs md:text-sm lg:text-base rounded-full">Update Profile</button>
                    </div>
                    {message && <p className="text-center text-green-500 text-xs md:text-sm lg:text-base  mt-4">{message}</p>}
                    {error && <p className="text-center text-red-500 text-xs md:text-sm lg:text-base mt-4">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default Profile;
