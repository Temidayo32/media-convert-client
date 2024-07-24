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
  const [showUser, setShowUser ] = useState(false);
  const [open, setOpen] = useState(false);
  
  return (
    <DataContext.Provider value={{
      showSignUpOptions,
      setShowSignUpOptions,
      uploadedVideos,
      setUploadedVideos,
      uploadedImages,
      setUploadedImages,
      downloadPageActive,
      setDownloadPageActive,
      displayType,
      setDisplayType,
      showUser,
      setShowUser,
      idToken,
      setIdToken,
      emailVerified,
      setEmailVerified,
      userCredentials,
      setUserCredentials,
      oversizedFiles,
      setOversizedFiles,
      showErrorMessages,
      setShowErrorMessages,
      showUploadForm,
      setShowUploadForm,
      open,
      setOpen,
    }}>
      {children}
    </DataContext.Provider>
  );

}
  

export const useData = () => useContext(DataContext);
