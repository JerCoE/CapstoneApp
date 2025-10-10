import React, { useState } from 'react';
import './LoginScreen.css';

type LoginScreenProps = {
  onLogin: (email: string, password: string) => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // invoke the callback provided by the parent
    onLogin(email, password);
  };

  return (
    <div className="BackgroundPortal">
      <div className="login-container">
        <h2 style={{ textAlign: 'center' }}>ERNI Login Portal</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              className="input-field"
              type="text"
              id="email"
              placeholder="employee@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              className="input-field"
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Enter</button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;