import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const UploadFingerprint = ({ setAccountDetails }) => {
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleUpload = () => {
    if (!file || !username) {
      alert('Please select a file and enter your username.');
      return;
    }

    const formData = new FormData();
    formData.append('fingerprint', file);
    formData.append('username', username);

    fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setAccountDetails(data.accountDetails);
          navigate('/details');
        } else {
          alert('Authentication failed: ' + data.message);
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
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload Fingerprint</button>
      </div>
    </div>
  );
};

export default UploadFingerprint;
