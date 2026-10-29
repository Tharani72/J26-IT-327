import React from 'react';
import SiteNavbar from './SiteNavbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  studentProfile?: boolean;
  teacherProfile?: boolean;
}

export default function MainLayout({ 
  children, 
  studentProfile = true, 
  teacherProfile = false 
}: MainLayoutProps) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 🟢 1. හැම Page එකකටම පොදු Background Video එක */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -2,
        }}
      >
        <source src="/dashboard-bg.png.webm" type="video/webm" />
      </video>

      {/* 🟢 2. Light Ambient Overlay එක */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255, 255, 255, 0.12)',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <SiteNavbar studentProfile={studentProfile} teacherProfile={teacherProfile} />

      {/* Page Body */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}