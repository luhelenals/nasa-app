import React, { useState } from 'react';
import './App.css'; // Importa o arquivo CSS externo
import Login from './Login'; // Importa o componente Login
import Register from './Register'; // Importa o componente Register
import Dashboard from './Dashboard'; // Importa o novo componente Dashboard

function App() {
  // State para mensagens de erro ou sucesso
  const [message, setMessage] = useState('');
  // State para o estado de carregamento
  const [loading, setLoading] = useState(false);
  // State para armazenar os tokens de acesso e refresh (apenas para login)
  const [tokens, setTokens] = useState(null);
  // Novo state para armazenar o token de acesso para requisições autenticadas
  const [accessToken, setAccessToken] = useState(null);

  // State para controlar qual formulário/página está visível: 'login', 'register' ou 'dashboard'
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
          // Renderiza o componente Login
          <Login
            setMessage={setMessage}
            setLoading={setLoading}
            setTokens={setTokens}
            setAccessToken={setAccessToken} // <--- Esta linha é crucial!
            setCurrentPage={setCurrentPage} // Passa a função para mudar a página para 'dashboard'
            message={message}
            loading={loading}
            tokens={tokens}
            clearFormStates={clearFormStates}
          />
        )}

        {currentPage === 'register' && (
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

        {currentPage === 'dashboard' && (
          // Renderiza o componente Dashboard
          <Dashboard
            accessToken={accessToken} // Passa o accessToken para o Dashboard
            setCurrentPage={setCurrentPage} // Passa a função para logout
            clearFormStates={clearFormStates} // Passa a função para limpar estados
          />
        )}
      </div>
    </>
  );
}

export default App;
