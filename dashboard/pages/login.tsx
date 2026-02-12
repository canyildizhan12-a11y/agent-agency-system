import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple redirect to dashboard - no auth needed
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '40px',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '10px', fontSize: '32px' }}>
          🦉 Agent Agency
        </h1>
        <p style={{ color: '#aaa', marginBottom: '30px' }}>
          Your AI Team Dashboard
        </p>

        <form onSubmit={handleEnter}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px 32px',
              borderRadius: '8px',
              border: 'none',
              background: '#00ff88',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              width: '100%'
            }}
          >
            {loading ? 'Loading...' : 'Enter Dashboard'}
          </button>
        </form>

        <p style={{ 
          marginTop: '20px', 
          fontSize: '12px', 
          color: '#666' 
        }}>
          7 AI agents waiting for your commands
        </p>
      </div>
    </div>
  );
}
