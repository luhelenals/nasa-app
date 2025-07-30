import React, { useState } from 'react';
import axios from 'axios';

function Register({ setMessage, setLoading, setCurrentPage, message, loading, clearFormStates }) {
  // States para os campos de input do formulário de Registro
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');

  // Função para lidar com o envio do formulário de registro
  const handleRegister = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página
    clearFormStates(); // Limpa mensagens ao iniciar nova tentativa
    setLoading(true); // Ativa o estado de carregamento

    try {
      // Fazendo a requisição POST para o endpoint de registro
      const response = await axios.post('http://localhost:8000/register/', {
        username: registerUsername,
        password: registerPassword,
        email: registerEmail,
        first_name: registerFirstName
      });

      // Se a requisição for bem-sucedida (status 201 Created)
      if (response.status === 201) {
        setMessage('Conta criada com sucesso! Faça login para continuar.');
        console.log('Usuário registrado:', response.data);
        // Redirecionar para a página de login após o registro
        setCurrentPage('login');
        // Limpar os campos de registro
        setRegisterUsername('');
        setRegisterPassword('');
        setRegisterEmail('');
        setRegisterFirstName('');
      }

    } catch (error) {
      console.error("Erro no registro:", error);
      if (error.response && error.response.data) {
        // Tenta pegar mensagens de erro específicas da API
        let errorMsg = 'Erro ao criar conta.';
        if (error.response.data.username) {
          errorMsg += ` Usuário: ${error.response.data.username.join(', ')}`;
        }
        if (error.response.data.email) {
          errorMsg += ` Email: ${error.response.data.email.join(', ')}`;
        }
        setMessage(errorMsg);
      } else {
        setMessage('Ocorreu um erro ao tentar criar a conta. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };

  return (
    <>
      <h1 className="login-title">Criar Conta</h1>

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="register-username" className="form-label">
            Nome de Usuário
          </label>
          <input
            type="text"
            id="register-username"
            className="form-input"
            placeholder="Escolha um nome de usuário"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="register-email"
            className="form-input"
            placeholder="Digite seu email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-first-name" className="form-label">
            Nome (Opcional)
          </label>
          <input
            type="text"
            id="register-first-name"
            className="form-input"
            placeholder="Seu primeiro nome"
            value={registerFirstName}
            onChange={(e) => setRegisterFirstName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-password" className="form-label">
            Senha
          </label>
          <input
            type="password"
            id="register-password"
            className="form-input"
            placeholder="Crie uma senha"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
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
            'Registrar'
          )}
        </button>
      </form>

      <p className="signup-text">
        Já tem uma conta?{' '}
        <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); setCurrentPage('login'); clearFormStates(); }}>
          Fazer Login
        </a>
      </p>
    </>
  );
}

export default Register;
