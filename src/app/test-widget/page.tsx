'use client';

import { useEffect, useState } from 'react';
import { Metadata } from 'next';

export default function TestWidgetPage() {
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get a workspace ID for testing
    const fetchWorkspaceId = async () => {
      try {
        // Try to get user's workspace first
        let response = await fetch('/api/workspace/info');
        if (response.ok) {
          const data = await response.json();
          setWorkspaceId(data.workspace?.id || 'demo-workspace');
        } else {
          // Fallback to demo workspace for testing
          response = await fetch('/api/demo/workspace');
          if (response.ok) {
            const data = await response.json();
            setWorkspaceId(data.workspace?.id || '550e8400-e29b-41d4-a716-446655440000');
          } else {
            setWorkspaceId('550e8400-e29b-41d4-a716-446655440000');
          }
        }
      } catch (error) {
        console.error('Failed to fetch workspace:', error);
        setWorkspaceId('550e8400-e29b-41d4-a716-446655440000');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceId();
  }, []);

  useEffect(() => {
    if (!loading && workspaceId) {
      // Dynamically load the widget script
      const script = document.createElement('script');
      script.src = '/widget.js';
      script.setAttribute('data-api-url', window.location.origin);
      script.setAttribute('data-workspace-id', workspaceId);
      script.setAttribute('data-title', 'Chat with Acme Corp');
      script.setAttribute('data-subtitle', 'We\'re here to help you grow!');
      script.setAttribute('data-primary-color', '#0A4D68');
      script.setAttribute('data-accent-color', '#FF6B6B');
      script.setAttribute('data-position', 'bottom-right');
      script.async = true;
      
      document.body.appendChild(script);

      return () => {
        // Cleanup script when component unmounts
        document.body.removeChild(script);
      };
    }
  }, [loading, workspaceId]);

  if (loading) {
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        margin: 0, 
        padding: '40px', 
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #0A4D68',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666' }}>Loading widget test page...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: '40px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            background: 'linear-gradient(135deg, #0A4D68, #FF6B6B)', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px'
          }}>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>A</span>
          </div>
          <div>
            <h1 style={{ color: '#333', margin: 0, fontSize: '28px' }}>Acme Corporation</h1>
            <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>Technology Solutions & Consulting</p>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '30px',
          border: '1px solid #bbdefb'
        }}>
          <h3 style={{ color: '#1565c0', marginTop: 0, marginBottom: '10px' }}>🧪 Widget Test Page</h3>
          <p style={{ color: '#1976d2', margin: 0, fontSize: '14px' }}>
            This page demonstrates the LeadFlow AI chat widget. The widget is now active with workspace ID: <strong>{workspaceId}</strong>
          </p>
        </div>
        
        <h2 style={{ color: '#333', marginTop: '30px', marginBottom: '15px' }}>Welcome to Acme Corp</h2>
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
          We are a leading technology company that helps businesses transform and grow through innovative digital solutions.
          Our team of experts provides comprehensive consulting, development, and support services to companies worldwide.
        </p>
        
        <h2 style={{ color: '#333', marginTop: '30px', marginBottom: '15px' }}>Our Services</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h3 style={{ color: '#333', marginTop: 0 }}>💻 Web Development</h3>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Custom web applications and responsive websites</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h3 style={{ color: '#333', marginTop: 0 }}>📱 Mobile Apps</h3>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>iOS and Android mobile application development</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h3 style={{ color: '#333', marginTop: 0 }}>🤖 AI Solutions</h3>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Machine learning and artificial intelligence integration</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h3 style={{ color: '#333', marginTop: 0 }}>📊 Business Consulting</h3>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Strategic planning and digital transformation</p>
          </div>
        </div>
        
        <div style={{ marginTop: '40px', padding: '25px', backgroundColor: '#fff3e0', borderRadius: '8px', border: '1px solid #ffcc02' }}>
          <h3 style={{ color: '#f57c00', marginTop: 0, marginBottom: '15px' }}>🚀 Test the Widget</h3>
          <ol style={{ color: '#ef6c00', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Look for the <strong>chat button</strong> in the bottom-right corner</li>
            <li>Click on it to <strong>start a conversation</strong> with our AI</li>
            <li>Try asking about our services, pricing, or company information</li>
            <li>The AI will <strong>qualify you as a lead</strong> based on your responses</li>
            <li>Check your LeadFlow AI dashboard to see the conversation and lead data</li>
          </ol>
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #ffcc02' }}>
            <p style={{ color: '#f57c00', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
              💡 Tip: Try mentioning your company name, industry, or specific needs to see how the AI captures lead information!
            </p>
          </div>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
            This is a demonstration of how the LeadFlow AI widget works on any website. 
            The widget connects to your LeadFlow AI dashboard and automatically qualifies visitors as leads.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}