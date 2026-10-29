import React from 'react';
import MainLayout from './components/common/MainLayout';
import GloveDashboardPage from './pages/GloveDashboardPage';
// අලුතින් හදපු Developer Tool එක
import SignCalibrationTool from './pages/SignCalibrationTool'; 

export default function App() {
  
  const currentPath = window.location.pathname;

  // ඔයාගේ Secret URL එක - මේකෙන් ගියාම කෙළින්ම Data එකතු කරන පිටුවට යනවා
  if (currentPath === '/glove-setup') {
    return (
      // මෙතන Header/Footer පෙන්වන්නේ නෑ, මොකද මේක ඔයාගේ internal වැඩකට ගන්න Page එකක් නිසා
      <SignCalibrationTool />
    );
  }

  // සාමාන්‍ය ළමයින්ගේ Dashboard එක
  return (
    <MainLayout studentProfile={true}>
      <GloveDashboardPage />
    </MainLayout>
  );
}