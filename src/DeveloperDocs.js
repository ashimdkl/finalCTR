import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DeveloperDocs = () => {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handlePasswordSubmit = () => {
    if (password === 'powereng') {
      setAuthenticated(true);
    } else {
      alert('Incorrect password!');
    }
    
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {!authenticated ? (
        <div className="w-full max-w-sm bg-white border-2 border-gray-300 rounded-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Password</h2>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter password"
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          />
          <button
            onClick={handlePasswordSubmit}
            className="bg-blue-500 text-white py-2 px-4 rounded-md"
          >
            Submit
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl bg-white border-2 border-gray-300 rounded-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Developer Documentation</h2>
          <h3 className="text-xs font-semibold mb-4">Source Code written by Ashim Dhakal</h3>
          <a
            href="/source.txt" 
            download="SourceCode.txt"
            className="bg-green-500 text-white py-2 px-4 rounded-md"
          >
            Download Source Code
          </a>

          <button
        onClick={() => navigate('/')} // This navigates to the home route
        className="bg-red-500 text-white py-2 px-4 rounded-md mt-4"
      >
        Go Back to App.js
      </button>
        </div>
      )}
    </div>
  );
};

export default DeveloperDocs;
