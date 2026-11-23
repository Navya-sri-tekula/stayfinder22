import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StayFinderAssistant from '../components/StayFinderAssistant';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <StayFinderAssistant />
    </div>
  );
};

export default MainLayout;
