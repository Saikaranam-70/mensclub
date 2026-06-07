import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import LoadingScreen from './LoadingScreen';

export default function Layout({ children }) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('app_has_loaded');
    if (!hasLoaded) {
      setShowLoading(true);
      sessionStorage.setItem('app_has_loaded', 'true');
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showLoading && <LoadingScreen />}
      <Navbar />
      <main style={{ flex: 1, paddingTop: 70 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

