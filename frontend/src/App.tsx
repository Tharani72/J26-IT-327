import SmartGloveWidget from './features/smart-glove/SmartGloveWidget';

export default function App() {
  return (
    <main style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#1e293b' }}>OmniSign SL - Component Testing</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Haptic Smart Glove Module (Component 02)</p>

      {/* ඔයා හදපු Glove Widget එක මෙතැනින් පෙන්වයි */}
      <SmartGloveWidget />
    </main>
  );
}