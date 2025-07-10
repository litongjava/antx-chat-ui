import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useUser } from './context/UserContext';
import Chat from './components/Chat';
import Login from './components/Login';
import Register from './components/Register';
import Verification from './components/Verification';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { user } = useUser();
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { user } = useUser();
  return user ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/verification/email"
        element={
          <PublicRoute>
            <Verification />
          </PublicRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;