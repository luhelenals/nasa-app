import React, { useState } from 'react';
import './App.css'; // Importa o arquivo CSS externo
import Login from './Login'; // Importa o componente Login
import Register from './Register'; // Importa o componente Register

function App() {
  // State para mensagens de erro ou sucesso
  const [message, setMessage] = useState('');
  // State para o estado de carregamento
  const [loading, setLoading] = useState(false);
  // State para armazenar os tokens de acesso e refresh (apenas para login)
  const [tokens, setTokens] = useState(null);

  // State para controlar qual formulário está visível: 'login' ou 'register'
  const [currentPage, setCurrentPage] = useState('login');

  // Função para limpar mensagens e tokens ao mudar de página
  const clearFormStates = () => {
    setMessage('');
    setTokens(null);
  };

  return (
    <>
      <div className="login-container">
        {currentPage === 'login' ? (
          // Renderiza o componente Login
          <Login
            setMessage={setMessage}
            setLoading={setLoading}
            setTokens={setTokens}
            setCurrentPage={setCurrentPage}
            message={message}
            loading={loading}
            tokens={tokens}
            clearFormStates={clearFormStates}
          />
        ) : (
          // Renderiza o componente Register
          <Register
            setMessage={setMessage}
            setLoading={setLoading}
            setCurrentPage={setCurrentPage}
            message={message}
            loading={loading}
            clearFormStates={clearFormStates}
          />
        )}
      </div>
    </>
  );
}

export default App;
