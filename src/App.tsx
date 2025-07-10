import AppRoutes from './Routes';
import { useUser } from './context/UserContext';
import './App.css';

function App() {
  const { loading, error } = useUser();

  if (loading) {
    return <div className="loading-container">初始化中...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>初始化失败</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>重试</button>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;