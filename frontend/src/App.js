import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Asteroids from './Asteroids';

function App() {
  // States
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');

  // Função para limpar mensagens e tokens ao mudar de página
  const clearFormStates = () => {
    setMessage('');
    setTokens(null);
    // Limpar o accessToken ao sair da página principal ou fazer logout
    if (currentPage !== 'dashboard') {
      setAccessToken(null);
    }
  };

  return (
    <>
      <div className="login-container">
        {currentPage === 'login' && (
          <Login
            setMessage={setMessage}
            setLoading={setLoading}
            setTokens={setTokens}
            setAccessToken={setAccessToken}
            setCurrentPage={setCurrentPage} // mudar a página para 'dashboard'
            message={message}
            loading={loading}
            tokens={tokens}
            clearFormStates={clearFormStates}
          />
        )}

        {currentPage === 'register' && (
          <Register
            setMessage={setMessage}
            setLoading={setLoading}
            setCurrentPage={setCurrentPage}
            message={message}
            loading={loading}
            clearFormStates={clearFormStates}
          />
        )}

        {currentPage === 'dashboard' && (
          <Dashboard
            accessToken={accessToken}
            setCurrentPage={setCurrentPage}
            clearFormStates={clearFormStates}
          />
        )}

        {currentPage === 'asteroids' && (
          <Asteroids
            accessToken={accessToken}
            setCurrentPage={setCurrentPage}
            clearFormStates={clearFormStates}
          />
        )}
      </div>
    </>
  );
}

export default App;
