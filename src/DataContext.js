import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [showSignUpOptions, setShowSignUpOptions] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [downloadPageActive, setDownloadPageActive] = useState(false);

  return (
    <DataContext.Provider value={{ showSignUpOptions, setShowSignUpOptions, uploadedVideos, setUploadedVideos, downloadPageActive, setDownloadPageActive }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
