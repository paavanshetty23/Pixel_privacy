import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/theme.css';
import './styles/modern-bootstrap.css';
import logo from './logo.png';
import SingleSearch from './components/SingleSearch';
import FamilySearch from './components/FamilySearch';
import MultiSearch from './components/MultiSearch';

function App() {
  const [activeTab, setActiveTab] = useState('single');

  return (    <div className="min-vh-100 d-flex flex-column" style={{backgroundColor: '#1a1b26'}}>
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-dark border-bottom" style={{backgroundColor: '#16161e', borderBottomColor: '#414868'}}>
        <div className="container">          <a className="navbar-brand d-flex align-items-center" href="#home">
            <img src={logo} alt="Pixel Privacy" height="40" className="me-2" />
            <span className="fw-bold" style={{color: '#a9b1d6'}}>Pixel Privacy</span>
          </a>
          
          <div className="navbar-nav ms-auto">
            <ul className="nav nav-pills">
              <li className="nav-item">                <button 
                  className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
                  onClick={() => setActiveTab('home')}
                  style={{
                    backgroundColor: activeTab === 'home' ? '#7aa2f7' : 'transparent',
                    color: activeTab === 'home' ? '#1a1b26' : '#a9b1d6',
                    border: '1px solid #414868',
                    borderRadius: '8px'
                  }}
                >
                  <i className="bi bi-house me-2"></i>Home
                </button>
              </li>
              <li className="nav-item">                <button 
                  className={`nav-link ${activeTab === 'single' ? 'active' : ''}`}
                  onClick={() => setActiveTab('single')}
                  style={{
                    backgroundColor: activeTab === 'single' ? '#7aa2f7' : 'transparent',
                    color: activeTab === 'single' ? '#1a1b26' : '#a9b1d6',
                    border: '1px solid #414868',
                    borderRadius: '8px'
                  }}
                >
                  <i className="bi bi-search me-2"></i>Single Search
                </button>
              </li>
              <li className="nav-item">                <button 
                  className={`nav-link ${activeTab === 'multi' ? 'active' : ''}`}
                  onClick={() => setActiveTab('multi')}
                  style={{
                    backgroundColor: activeTab === 'multi' ? '#7aa2f7' : 'transparent',
                    color: activeTab === 'multi' ? '#1a1b26' : '#a9b1d6',
                    border: '1px solid #414868',
                    borderRadius: '8px'
                  }}
                >
                  <i className="bi bi-collection me-2"></i>Multi Search
                </button>
              </li>
              <li className="nav-item">                <button 
                  className={`nav-link ${activeTab === 'family' ? 'active' : ''}`}
                  onClick={() => setActiveTab('family')}
                  style={{
                    backgroundColor: activeTab === 'family' ? '#7aa2f7' : 'transparent',
                    color: activeTab === 'family' ? '#1a1b26' : '#a9b1d6',
                    border: '1px solid #414868',
                    borderRadius: '8px'
                  }}
                >
                  <i className="bi bi-people me-2"></i>Family Search
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid flex-grow-1 py-4">
        <div className="row">
          <div className="col-12">
            
            {/* Home Tab */}
            {activeTab === 'home' && (
              <div className="text-center py-5">
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <img src={logo} alt="Pixel Privacy" height="120" className="mb-4" />                    <h1 className="mb-4" style={{color: '#a9b1d6'}}>Welcome to Pixel Privacy</h1>
                    <p className="lead mb-5" style={{color: '#9aa5ce'}}>
                      Protect your digital identity by discovering if your personal information has been exposed online.
                    </p>
                    
                    <div className="row g-4 mb-5">                      <div className="col-md-4">
                        <div className="card border-0" style={{backgroundColor: '#24283b', border: '1px solid #414868'}}>
                          <div className="card-body text-center">
                            <i className="bi bi-search mb-3" style={{fontSize: '3rem', color: '#7aa2f7'}}></i>
                            <h5 style={{color: '#a9b1d6'}}>Single Search</h5>
                            <p className="card-text" style={{color: '#9aa5ce'}}>Check individual PII exposure</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card border-0" style={{backgroundColor: '#24283b', border: '1px solid #414868'}}>
                          <div className="card-body text-center">
                            <i className="bi bi-collection mb-3" style={{fontSize: '3rem', color: '#9ece6a'}}></i>
                            <h5 style={{color: '#a9b1d6'}}>Multi Search</h5>
                            <p className="card-text" style={{color: '#9aa5ce'}}>Batch check multiple PII entries</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card border-0" style={{backgroundColor: '#24283b', border: '1px solid #414868'}}>
                          <div className="card-body text-center">
                            <i className="bi bi-people mb-3" style={{fontSize: '3rem', color: '#e0af68'}}></i>
                            <h5 style={{color: '#a9b1d6'}}>Family Search</h5>
                            <p className="card-text" style={{color: '#9aa5ce'}}>Check family members' data</p>
                          </div>
                        </div>
                      </div>
                    </div>
                      <button 
                      className="btn btn-lg"
                      onClick={() => setActiveTab('single')}
                      style={{
                        backgroundColor: '#7aa2f7',
                        color: '#1a1b26',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 32px',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#89b4fa';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#7aa2f7';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <i className="bi bi-arrow-right me-2"></i>
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Single Search Tab */}
            {activeTab === 'single' && <SingleSearch />}

            {/* Multi Search Tab */}
            {activeTab === 'multi' && <MultiSearch />}

            {/* Family Search Tab */}
            {activeTab === 'family' && <FamilySearch />}

          </div>
        </div>
      </div>      {/* Footer */}
      <footer className="border-top mt-auto py-3" style={{backgroundColor: '#16161e', borderTopColor: '#414868'}}>
        <div className="container text-center">
          <p className="mb-0" style={{color: '#a9b1d6'}}>
            <i className="bi bi-shield-lock me-2"></i>
            &copy; 2025 Pixel Privacy - Protecting Your Digital Identity
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
