import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/Login';
import UploadFingerprint from './components/UploadFingerprint';
import DisplayAccountDetails from './components/DisplayAccountDetails';
import Savings from './components/Savings';
import Withdrawal from './components/Withdrawal';

const App = () => {
  const [accountDetails, setAccountDetails] = useState({ balance: 0 });
  const [user, setUser] = useState({ username: '' }); // Initialize with an empty username

  const updateBalance = (newBalance) => {
    setAccountDetails((prevDetails) => ({
      ...prevDetails,
      balance: newBalance,
    }));
  };

  return (
    <Router>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/upload" element={<UploadFingerprint setAccountDetails={setAccountDetails} />} />
          <Route path="/details" element={<DisplayAccountDetails details={accountDetails} />} />
          
          {/* Home route displaying the Savings component */}
          <Route
            path="/"
            element={
              <div className="App">
                <h1>Welcome to the ATM System</h1>
                {user.username ? <h2>Hello, {user.username}!</h2> : <h2>Please log in</h2>}
                <Savings setAccountDetails={setAccountDetails} username={user.username} />
              </div>
            }
          />
          
          {/* Savings and Withdrawal routes */}
          <Route path="/savings" element={<Savings setAccountDetails={setAccountDetails} username={user.username} />} />
          <Route path="/withdrawal" element={<Withdrawal username={user.username} updateBalance={updateBalance} />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
