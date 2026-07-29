import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Marketplace from './components/Marketplace';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Contact';
import SmoothScrolling from './components/SmoothScrolling';
import './App.css';

function Storefront() {
  return (
    <>
      <Navbar />
      <SmoothScrolling>
        <Marketplace />
        <Footer />
      </SmoothScrolling>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Storefront />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
