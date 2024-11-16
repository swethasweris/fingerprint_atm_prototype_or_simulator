import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const Withdrawal = ({ username, setAccountDetails, updateBalance }) => {
  const [amount, setAmount] = useState('');
  const [enteredUsername, setEnteredUsername] = useState(username); // Local state for username
  const navigate = useNavigate();

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setEnteredUsername(event.target.value); // Update local username state
  };

  const handleWithdraw = () => {
    if (!amount || !enteredUsername) {
      alert('Please enter an amount and your username.');
      return;
    }

    fetch('http://localhost:5000/withdrawal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: enteredUsername, // Use the local username state
        amount: parseFloat(amount),
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          alert('Error: ' + (data.message || 'Something went wrong'));
          return;
        }

        if (data.success) {
          console.log('New balance after withdrawal:', data.balance);

          // Update the balance using the passed updateBalance function
          updateBalance(data.balance);

          alert(`Withdrawal successful! Your new balance is: ${data.balance}`);
          navigate('/details');
        }
      })
      .catch((error) => {
        alert('Error: ' + error.message);
        console.error('Error:', error);
      });
  };

  return (
    <div className="main-content">
      <div className="container">
        <input
          type="text"
          placeholder="Enter your username"
          value={enteredUsername} // Bind to local state
          onChange={handleUsernameChange} // Update local state on change
        />
        <input
          type="number"
          placeholder="Enter amount to withdraw"
          value={amount}
          onChange={handleAmountChange}
        />
        <button onClick={handleWithdraw}>Withdraw Money</button>
      </div>
    </div>
  );
};

export default Withdrawal;
