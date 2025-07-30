import React, { useState, useEffect } from 'react';
import './Asteroids.css';

const Asteroids = ({ accessToken, setCurrentPage, clearFormStates }) => {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const handleGoBack = () => {
    setCurrentPage('dashboard'); // Volta para a página de dashboard
  };

  const handleLogout = () => {
    setCurrentPage('login'); // Volta para a página de login
    clearFormStates(); // Limpa estados relacionados a login/tokens
  };

  // Função para buscar a lista de asteroides
  useEffect(() => {
    const fetchAsteroids = async () => {
      try {
        const response = await fetch('http://localhost:8000/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        setAsteroids(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAsteroids();
  }, []); // garante que rode apenas uma vez ao montar o componente

  // Função para buscar os detalhes de um asteroide específico
  const fetchAsteroidDetails = async (id) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const response = await fetch(`http://localhost:8000/asteroide/${id}/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      setSelectedAsteroid(data);
      setIsModalOpen(true);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  // Função para fechar o modal de detalhes
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAsteroid(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Carregando asteroides...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">Erro ao carregar asteroides: {error}</p>
      </div>
    );
  }

  return (
    <div className="asteroid-list-container">
      <h1 className="main-title">
        Asteroides Cadastrados
      </h1>

      <div className="asteroids-button-container">
        <button onClick={handleLogout} className="asteroids-button-logout">
          Sair
        </button>
        <button onClick={handleGoBack} className="asteroids-button-dashboard">
          Dashboard
        </button>
      </div>

      <div className="asteroid-grid">
        {asteroids.length > 0 ? (
          asteroids.map((asteroid) => (
            <div
              key={asteroid.id}
              className="asteroid-card"
              onClick={() => fetchAsteroidDetails(asteroid.id)}
            >
              <h2 className="asteroid-name" title={asteroid.name}>
                {asteroid.name}
              </h2>
              <p className="asteroid-velocity-label">
                Velocidade Relativa:{" "}
                <span className="asteroid-velocity-value">
                  {asteroid.relative_velocity_km_per_second?.toFixed(2) || 'N/A'} km/s
                </span>
              </p>
              <button
                className="details-button"
                onClick={(e) => {
                  e.stopPropagation(); // Evita que o clique no botão feche o modal
                  fetchAsteroidDetails(asteroid.id);
                }}
              >
                Ver Detalhes
              </button>
            </div>
          ))
        ) : (
          <p className="no-asteroids-message">Nenhum asteroide encontrado.</p>
        )}
      </div>

      {/* Modal de Detalhes do Asteroide */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-button"
              onClick={closeModal}
            >
              &times;
            </button>
            {detailLoading ? (
              <p className="modal-loading-text">Carregando detalhes...</p>
            ) : detailError ? (
              <p className="modal-error-text">Erro ao carregar detalhes: {detailError}</p>
            ) : selectedAsteroid ? (
              <>
                <h3 className="modal-title">
                  {selectedAsteroid.name}
                </h3>
                <div className="modal-details">
                  <p>
                    <span className="detail-label">Diâmetro Estimado (Min):</span>{" "}
                    {selectedAsteroid.estimated_diameter_min_meters?.toFixed(2)} metros
                  </p>
                  <p>
                    <span className="detail-label">Diâmetro Estimado (Max):</span>{" "}
                    {selectedAsteroid.estimated_diameter_max_meters?.toFixed(2)} metros
                  </p>
                  <p>
                    <span className="detail-label">Velocidade Relativa:</span>{" "}
                    {selectedAsteroid.relative_velocity_km_per_second?.toFixed(2)} km/s
                  </p>
                  <p>
                    <span className="detail-label">Magnitude Absoluta (H):</span>{" "}
                    {selectedAsteroid.absolute_magnitude_h?.toFixed(2)}
                  </p>
                  <p>
                    <span className="detail-label">Potencialmente Perigoso:</span>{" "}
                    {selectedAsteroid.is_potentially_hazardous_asteroid ? "Sim" : "Não"}
                  </p>
                  <p>
                    <span className="detail-label">Objeto Sentry:</span>{" "}
                    {selectedAsteroid.is_sentry_object ? "Sim" : "Não"}
                  </p>
                  <p>
                    <span className="detail-label">Data de Importação:</span>{" "}
                    {selectedAsteroid.imported_date}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};

export default Asteroids;
