import { Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DocPage from './pages/DocPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/doc/:id" element={<RequireAuth><DocPage /></RequireAuth>} />
      <Route path="*" element={<p className="center">Page not found. <a href="/">Home</a></p>} />
    </Routes>
  );
}