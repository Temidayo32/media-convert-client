import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HomePage, VideoConverter } from './pages';
import { Footer, Header } from './components';
import { DataProvider } from './DataContext'; // Import DataProvider

const AppRoutes = () => {
  return (
    <Router>
      <DataProvider> 
        <Header/>
        <Routes>
          <Route exact path="/" element={<HomePage/>} />
          <Route path="/video-converter/:format" element={<VideoConverter/>} />
          {/* Add other routes here */}
        </Routes>
        <Footer/>
      </DataProvider>
    </Router>
  );
};

export default AppRoutes;
