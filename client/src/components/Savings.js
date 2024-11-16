import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const Savings = ({ setAccountDetails }) => {
  const [amount, setAmount] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleSave = () => {
    if (!amount || !username) {
      alert('Please enter an amount and your username.');
      return;
    }

    fetch('http://localhost:5000/savings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        amount: parseFloat(amount),
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setAccountDetails(prevDetails => ({
            ...prevDetails,
            balance: data.balance, // Update balance in account details
          }));
          alert('Amount saved successfully! New balance: ' + data.balance);
          navigate('/details'); // Redirect to account details or desired page
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="main-content">
      <div className="container">
        <input 
          type="text" 
          placeholder="Enter your username" 
          value={username} 
          onChange={handleUsernameChange} 
        />
        <input 
          type="number" 
          placeholder="Enter amount to save" 
          value={amount} 
          onChange={handleAmountChange} 
        />
        <button onClick={handleSave}>Save Money</button>
      </div>
    </div>
  );
};

export default Savings;
