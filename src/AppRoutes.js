import React, {useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, Navigate } from 'react-router-dom';
import { HomePage, VideoConverter, DownloadPage } from './pages';
import { Footer, Header } from './components';
import {  useData } from './DataContext'; // Import DataProvider

const ProtectedRoute = ({ element, redirectTo }) => {
  const { downloadPageActive } = useData();
  return downloadPageActive ? element : <Navigate to={redirectTo} />;
};

const AppRoutes = () => {

  return (
    <Router>
        <Header/>
        <Routes>
          <Route exact path="/" element={<HomePage/>} />
          <Route path="/video-converter/:format" element={<VideoConverter/>} />
          <Route 
            path="/download" 
            element={<ProtectedRoute element={<DownloadPage />} redirectTo="/" />} 
          />
          {/* Add other routes here */}
        </Routes>
        <Footer/>
    </Router>
  );
};

export default AppRoutes;
