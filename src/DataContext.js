import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [showSignUpOptions, setShowSignUpOptions] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [downloadPageActive, setDownloadPageActive] = useState(false);
  const [idToken, setIdToken] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false); 
  const [userCredentials, setUserCredentials] = useState(null);
  const [displayType, setDisplayType] = useState('');
  const [oversizedFiles, setOversizedFiles] = useState([]);
  const [showErrorMessages, setShowErrorMessages] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(true);
  

  return (
    <DataContext.Provider value={{ showSignUpOptions, setShowSignUpOptions, uploadedVideos, setUploadedVideos, uploadedImages, setUploadedImages, downloadPageActive, displayType, setDisplayType, setDownloadPageActive, idToken, setIdToken, emailVerified, setEmailVerified, userCredentials, setUserCredentials, oversizedFiles, setOversizedFiles, showErrorMessages, setShowErrorMessages, showUploadForm, setShowUploadForm }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
