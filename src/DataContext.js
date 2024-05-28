import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [showSignUpOptions, setShowSignUpOptions] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [downloadPageActive, setDownloadPageActive] = useState(false);
  const [idToken, setIdToken] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false); 
  const [userCredentials, setUserCredentials] = useState(null);
  

  return (
    <DataContext.Provider value={{ showSignUpOptions, setShowSignUpOptions, uploadedVideos, setUploadedVideos, downloadPageActive, setDownloadPageActive, idToken, setIdToken, emailVerified, setEmailVerified, userCredentials, setUserCredentials }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
