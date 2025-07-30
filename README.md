# NASA-APP

Este projeto implementa uma API RESTful usando Django e Django REST Framework para gerenciar dados de asteroides. Ele permite listar, importar e visualizar informações detalhadas sobre asteroides, além de fornecer indicadores estatísticos. A aplicação é conteinerizada com Docker para facilitar o desenvolvimento e a implantação.

---

## 🚀 Funcionalidades

* **Listagem de Asteroides:** Permite obter uma lista de todos os asteroides cadastrados, com a opção de filtrar por data de importação.
* **Detalhes do Asteroide:** Acessa informações detalhadas de um asteroide específico usando seu ID.
* **Importação de Dados:** Importa dados de asteroides da API da NASA para uma data específica ou para a data atual.
* **Indicadores Estatísticos:** Fornece métricas e estatísticas sobre os asteroides na base de dados (ex: total, média de velocidade, diâmetro, asteroides perigosos).
* **Autenticação de Usuários:** Sistema de registro e autenticação de usuários via Token (DRF Token Authentication).
* **Documentação Interativa:** Documentação da API gerada automaticamente com Swagger UI (via `drf-spectacular`).

---

## 🛠️ Tecnologias Utilizadas

* **Backend:**
    * [Django](https://www.djangoproject.com/)
    * [Django REST Framework (DRF)](https://www.django-rest-framework.org/)
    * [drf-spectacular](https://drf-spectacular.readthedocs.io/) (para documentação OpenAPI/Swagger)
* **Frontend:**
    * [React](https://react.dev/)
    * [Axios](https://axios-http.com/)
* **Banco de Dados:** PostgreSQL
* **Conteinerização:**
    * [Docker](https://www.docker.com/)
    * [Docker Compose](https://docs.docker.com/compose/)
* **Requisições HTTP:** [Requests](https://docs.python-requests.org/en/latest/)
---

## Estrutura do Projeto

NASA-APP/
├── backend/                 
│   ├── api/                  # Aplicação Django de API
│   ├── backend/              # Configurações do projeto Django
│   ├── .dockerignore         
│   ├── compose.yaml          # Configuração do Docker Compose
│   ├── Dockerfile            # Dockerfile para o backend
│   ├── manage.py             # Utilitário de linha de comando do Django
│   └── requirements.txt      # Dependências Python
└── frontend/                 
    ├── public/               
    ├── src/                  # Código fonte da aplicação React
    │   └── App.js            # Componente principal da aplicação
    ├── node_modules/         # Dependências do Node.js
    ├── package.json          # Metadados
    └── .env                  # Variáveis de ambiente

## ⚙️ Configuração e Execução

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

* **Docker e Docker Compose:** Essenciais para a execução do backend.
    * [Instalar Docker](https://docs.docker.com/get-docker/)
    * [Instalar Docker Compose](https://docs.docker.com/compose/install/)
* **Node.js e npm (ou Yarn):** Necessários para o ambiente de desenvolvimento do frontend React.
    * [Instalar Node.js](https://nodejs.org/en/download/) (npm vem junto com o Node.js)
    * [Instalar Yarn](https://classic.yarnpkg.com/en/docs/install/) (opcional, se preferir usar Yarn em vez de npm)

### 1. Clonar o Repositório

```bash
git clone https://github.com/luhelenals/nasa-app.git
cd <nome_da_pasta_do_projeto>
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (na mesma pasta do `docker-compose.yml`) com as seguintes variáveis:

```
# .env
SECRET_KEY=sua_chave_secreta_aqui_gerada_pelo_django
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
NASA_API_KEY=SUA_CHAVE_API_DA_NASA
```

* **`SECRET_KEY`**: Uma chave secreta para o Django. Você pode gerar uma no shell do Django:
    ```python
    python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
    ```
* **`NASA_API_KEY`**: Uma chave de API da NASA para acessar o endpoint de Near Earth Objects. Você pode obter uma [aqui](https://api.nasa.gov/).

### 3. Construir e Iniciar os Contêineres Docker

Na raiz do projeto, execute:

```bash
docker-compose build
docker-compose up -d
```

### 4. Executar Migrações do Banco de Dados

```bash
docker-compose exec app python manage.py migrate
```

### 5. Criar um Superusuário (Opcional, para Acesso ao Admin)

```bash
docker-compose exec app python manage.py createsuperuser
```

### 6. Executar o Frontend React

```bash
cd frontend/
npm install  # ou yarn install
npm start    # ou yarn start
```
---

## 💡 API Endpoints

A API estará disponível em `http://localhost:8000/`
- Documentação via Swagger UI em `http://localhost:8000/api/schema/swagger-ui/`
- Documentação via Redoc em `http://localhost:8000/api/schema/redoc/`

Todos os endpoints, exceto o de registro de usuário, exigem autenticação via **Bearer Token** no cabeçalho `Authorization`.

**Resumo dos endpoints**
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/` | Retorna uma lista de todos os asteroides cadastrados, com opção de filtrar por data de importação. |
| `GET` | `/asteroide/{id}/` | Retorna os detalhes de um asteroide específico usando seu ID. |
| `POST` | `/importar/` | Importa dados de asteroides para uma data específica ou para a data atual, se nenhuma for fornecida. |
| `GET` | `/indicadores/` | Obtém indicadores relacionados aos asteroides. |
| `POST` | `/register/` | Registra um novo usuário. |
| `POST` | `/token/` | Obtém um par de tokens de acesso e refresh JWT para autenticação. |
| `POST` | `/token/refresh/` | Renova o token de acesso usando um token de refresh válido. |
| `POST` | `/token/verify/` | Verifica a validade de um token. |