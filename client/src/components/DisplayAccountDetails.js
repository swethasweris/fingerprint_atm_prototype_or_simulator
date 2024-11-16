import React from 'react'; // Removed useState since it's not used
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import '../styles.css';

const DisplayAccountDetails = ({ details }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  if (!details) return null;

  return (
    <div className="details-container">
      <h2>Account Details</h2>
      <img src="/images/download.png" alt="User" className="user-image" />

      <a href="https://www.rbi.org.in/" target="_blank" rel="noopener noreferrer" className="bank-link">
        Visit Bank Website
      </a>

      <div className="cards-grid">
        <div className="details-card">
          <p><strong>Account Number:</strong> {details.accountNumber}</p>
        </div>

        <div className="details-card">
          <p><strong>Account Holder:</strong> {details.username}</p>
        </div>

        <div className="details-card">
          <p><strong>Balance:</strong> {details.balance}</p>
        </div>

        <div className="details-card">
          <p><strong>Bank Name:</strong> {details.bankName}</p>
        </div>

        <div className="details-card">
          <p><strong>City:</strong> {details.city}</p>
        </div>

        <div className="details-card">
          <p><strong>Type:</strong> {details.type}</p>
        </div>
      </div>

      {/* Save and Withdraw Buttons */}
      <div className="action-buttons">
        <button onClick={() => navigate('/savings')}>Save</button>
        <button onClick={() => navigate('/withdrawal')}>Withdraw</button>
      </div>
    </div>
  );
};

export default DisplayAccountDetails;
