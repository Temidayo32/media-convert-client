import React, {useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, Navigate } from 'react-router-dom';
import { HomePage, VideoConverter, DownloadPage } from './pages';
import { Footer, Header, EmailVerificationRedirect, Dashboard } from './components';
import {  useData } from './DataContext'; // Import DataProvider

const DownloadProtectedRoute = ({ element, redirectTo }) => {
  const { downloadPageActive } = useData();
  return downloadPageActive ? element : <Navigate to={redirectTo} />;
};

const DashboardProtectedRoute = ({ element, redirectTo }) => {
  const { userCredentials } = useData();
  return userCredentials ? element : <Navigate to={redirectTo} />;
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
            element={<DownloadProtectedRoute element={<DownloadPage />} redirectTo="/" />} 
          />
          <Route path="/verify-email" element={<EmailVerificationRedirect/>} />
          <Route path="/dashboard/*" element={<DashboardProtectedRoute element={<Dashboard />} redirectTo="/" />}  />
          {/* Add other routes here */}
        </Routes>
        <Footer/>
    </Router>
  );
};

export default AppRoutes;
