import logo from './logo.svg';
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import { AuthContext } from './context/AuthContext';
import { Navigate } from 'react-router-dom';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/' element={<SignupPage/>}/>
            <Route path='/dashboard' element={<DashboardPage/>}/>
          </Routes>
      </BrowserRouter>
    </div>
  );


}

const RedirectToDashboard = () => {
  const { isLoggedIn } = React.useContext(AuthContext);
  return <Navigate to={isLoggedIn ? "/dashboard" : "/login"} />;
};

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = React.useContext(AuthContext);
  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default App;
