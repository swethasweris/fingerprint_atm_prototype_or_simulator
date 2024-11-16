import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const Register = () => {
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleRegister = () => {
    if (!file || !username || !password) {
      alert('Please enter a username, password, and upload a fingerprint.');
      return;
    }

    const formData = new FormData();
    formData.append('fingerprint', file);
    formData.append('username', username);
    formData.append('password', password);

    fetch('http://localhost:5000/register', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Registration successful!');
          navigate('/login');
        } else {
          alert('Registration failed: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleRegister}>Register Fingerprint</button>
    </div>
  );
};

export default Register;
