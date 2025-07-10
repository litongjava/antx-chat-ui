import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import {useUser} from './context/UserContext';
import Chat from './components/Chat';
import Login from './components/Login';
import Register from './components/Register';
import Verification from './components/Verification';
import UserProfile from "./components/UserProfile.tsx";

const PrivateRoute = ({children}: { children: React.ReactElement }) => {
  const {user} = useUser();
  return user ? children : <Navigate to="/login" replace/>;
};

// 修改：允许匿名用户访问公开页面
const PublicRoute = ({children}: { children: React.ReactElement }) => {
  const {user} = useUser();

  // 用户已登录且不是匿名用户时才重定向
  if (user && user.type > 0) {
    return <Navigate to="/" replace/>;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Chat/>
          </PrivateRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register/>
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login/>
          </PublicRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <UserProfile/>
        }
      />

      <Route
        path="/verification/email"
        element={
          <PublicRoute>
            <Verification/>
          </PublicRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;