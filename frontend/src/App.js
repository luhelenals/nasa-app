import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // States para os campos de input do formulário
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // State para mensagens de erro ou sucesso
  const [message, setMessage] = useState('');
  // State para o estado de carregamento
  const [loading, setLoading] = useState(false);
  // State para armazenar os tokens de acesso e refresh
  const [tokens, setTokens] = useState(null);

  // Função para lidar com o envio do formulário de login
  const handleLogin = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página
    setMessage(''); // Limpa mensagens anteriores
    setTokens(null); // Limpa tokens anteriores
    setLoading(true); // Ativa o estado de carregamento

    try {
      // Fazendo a requisição POST para o endpoint de login
      const response = await axios.post('http://localhost:8000/token/', {
        username: username,
        password: password
      });

      // Se a requisição for bem-sucedida, armazena os tokens e exibe mensagem
      setTokens(response.data);
      setMessage('Login bem-sucedido!');
      console.log('Tokens recebidos:', response.data);

    } catch (error) {
      console.error("Erro no login:", error);
      // Verifica se o erro é uma resposta do servidor com status 400 (Bad Request)
      if (error.response && error.response.status === 400) {
        setMessage('Nome de usuário ou senha incorretos.');
      } else {
        setMessage('Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };

  return (
    <>
      <div className="login-container">
        <h1 className="login-title">Entrar</h1>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Nome de Usuário
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Digite seu nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <div
              className={`message-box ${
                message.includes('sucesso') ? 'message-success' : 'message-error'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {tokens && (
          <div className="tokens-display">
            <h2>Tokens Recebidos:</h2>
            <p>
              <span>Refresh Token:</span> {tokens.refresh}
            </p>
            <p>
              <span>Access Token:</span> {tokens.access}
            </p>
          </div>
        )}

        <p className="signup-text">
          Não tem uma conta?{' '}
          <a href="#" className="signup-link">
            Cadastre-se
          </a>
        </p>
      </div>
    </>
  );
}

export default App;
