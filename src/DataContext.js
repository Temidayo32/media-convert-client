import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [showSignUpOptions, setShowSignUpOptions] = useState(false);

  return (
    <DataContext.Provider value={{ showSignUpOptions, setShowSignUpOptions }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
