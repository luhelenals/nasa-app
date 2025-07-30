import React, { useState } from 'react';
import axios from 'axios';

function Login({ setMessage, setLoading, setTokens, setAccessToken, setCurrentPage, message, loading, tokens, clearFormStates }) {
  // State para os campos de input do formulário de Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Função para lidar com o envio do formulário de login
  const handleLogin = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página
    clearFormStates(); // Limpa mensagens e tokens ao iniciar nova tentativa
    setLoading(true); // Ativa o estado de carregamento

    try {
      // Fazendo a requisição POST para o endpoint de login
      const response = await axios.post('http://localhost:8000/token/', {
        username: loginUsername,
        password: loginPassword
      });

      // Se a requisição for bem-sucedida, armazena os tokens e exibe mensagem
      setTokens(response.data); // Guarda ambos os tokens
      setAccessToken(response.data.access); // Guarda o access token separadamente
      console.log('Tokens recebidos:', response.data);

      // Redireciona para a página principal (dashboard) após um pequeno atraso
      setTimeout(() => {
        setCurrentPage('dashboard');
        setLoginUsername(''); // Limpa campos após login bem-sucedido
        setLoginPassword('');
      }, 1000);

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
      <h1 className="login-title">Entrar</h1>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="login-username" className="form-label">
            Nome de Usuário
          </label>
          <input
            type="text"
            id="login-username"
            className="form-input"
            placeholder="Digite seu nome de usuário"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password" className="form-label">
            Senha
          </label>
          <input
            type="password"
            id="login-password"
            className="form-input"
            placeholder="Digite sua senha"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
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

      <p className="signup-text">
        Não tem uma conta?{' '}
        <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); setCurrentPage('register'); clearFormStates(); }}>
          Cadastre-se
        </a>
      </p>
    </>
  );
}

export default Login;
