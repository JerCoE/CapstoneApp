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
    <div className="Pausepoint"><span className="pausepoint-text">PausePoint</span>
    <div className="BackgroundLogo">
       <div className="BGtext">
          <div className="login-container">
           <h2 style={{ textAlign: 'center', fontWeight: '600', color: '#113372' }}>Login</h2>
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
     </div>
    </div>
  );
};

export default LoginScreen;