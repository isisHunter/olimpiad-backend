import React from 'react';
import Main from './pages/Main';
import ConfirmEmail from './pages/EmailConfirmation'
import Enter from './pages/Enter'
import Search from './pages/Search'
import Dashboard from './pages/Dashboard';
import Error404 from './pages/404';
import ResetPassword from './pages/ResetPassword';
import AI from './pages/AIprep';
import { useAuth } from './authcontext';
import { Routes, Route, Navigate } from "react-router-dom";

const App = () => {
  const { user } = useAuth();
  return (
      <Routes>
        <Route index element={<Main />} />
        <Route path="enter" element={!user ? <Enter /> : <Navigate to="/dashboard" />} />
        <Route path="search" element={<Search />} />
        <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/enter" />} />
        <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/AI" element={<AI />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
  );
}

export default App;