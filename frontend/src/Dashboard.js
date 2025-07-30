import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

function Dashboard({ accessToken, setCurrentPage, clearFormStates }) {
  const [indicadoresData, setIndicadoresData] = useState(null);
  const [dashboardMessage, setDashboardMessage] = useState('Carregando dados...');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchIndicadores = async () => {
      if (!accessToken) {
        setDashboardMessage('Erro: Token de acesso não disponível.');
        setLoadingData(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/indicadores/', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setIndicadoresData(response.data);
        setDashboardMessage('Dados carregados com sucesso!');
      } catch (error) {
        console.error("Erro ao buscar indicadores:", error);
        setDashboardMessage('Erro ao carregar os indicadores. Verifique sua conexão ou token.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchIndicadores();
  }, [accessToken]); // Refaz a requisição se o accessToken mudar

  const handleLogout = () => {
    setCurrentPage('login'); // Volta para a página de login
    clearFormStates(); // Limpa todos os estados relacionados a login/tokens
  };

  // Prepara os dados de asteroides por data para o gráfico
  const asteroidsByDateChartData = indicadoresData?.asteroids_by_date ?
    Object.entries(indicadoresData.asteroids_by_date).map(([date, count]) => ({
      date,
      count
    })) : [];

  return (
    <div className="dashboard-container"> {/* Container principal para o dashboard */}
      <h1 className="dashboard-title">Dashboard de Indicadores</h1>

      <div className="dashboard-content">
        {loadingData ? (
          <p className="message-box message-success">{dashboardMessage}</p>
        ) : (
          <>
            {dashboardMessage && !indicadoresData && (
              <p className="message-box message-error">{dashboardMessage}</p>
            )}
            {indicadoresData ? (
              <>
                <div className="kpi-grid"> {/* Grid para os KPIs superiores */}
                  <div className="kpi-card">
                    <div className="kpi-value">{indicadoresData.total_asteroids}</div>
                    <div className="kpi-label">Total de Asteroides</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">{indicadoresData.unique_potentially_hazardous_asteroids}</div>
                    <div className="kpi-label">Asteroides Potencialmente Perigosos</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">{indicadoresData.avg_velocity_km_per_second.toFixed(2)} km/s</div>
                    <div className="kpi-label">Velocidade Média</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">{indicadoresData.avg_diameter_meters.toFixed(2)} m</div>
                    <div className="kpi-label">Diâmetro Médio</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">{indicadoresData.avg_asteroids_per_day}</div>
                    <div className="kpi-label">Média de Asteroides por Dia</div>
                  </div>
                </div>

                <div className="chart-panel"> {/* Painel para o gráfico */}
                  <h2>Asteroides por Data</h2>
                  {asteroidsByDateChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={asteroidsByDateChartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" stroke="#333" />
                        <YAxis stroke="#333" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px' }}
                          labelStyle={{ color: '#555' }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          name="Número de Asteroides"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>Nenhum dado de asteroide por data para exibir o gráfico.</p>
                  )}
                </div>
              </>
            ) : (
              // Mensagem de erro se não houver dados e não estiver carregando
              !loadingData && <p className="message-box message-error">Não foi possível carregar os dados.</p>
            )}
          </>
        )}
      </div>

      <button onClick={handleLogout} className="dashboard-button-logout"> {/* Nova classe para o botão de logout */}
        Sair
      </button>
    </div>
  );
}

export default Dashboard;