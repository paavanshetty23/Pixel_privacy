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

  return (
    <div className="min-vh-100 d-flex flex-column" style={{backgroundColor: '#000000'}}>
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-light">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#home">
            <img src={logo} alt="Pixel Privacy" height="40" className="me-2" />
            <span className="fw-bold text-white">Pixel Privacy</span>
          </a>
          
          <div className="navbar-nav ms-auto">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'home' ? 'active' : 'text-white'}`}
                  onClick={() => setActiveTab('home')}
                >
                  <i className="bi bi-house me-2"></i>Home
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'single' ? 'active' : 'text-white'}`}
                  onClick={() => setActiveTab('single')}
                >
                  <i className="bi bi-search me-2"></i>Single Search
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'multi' ? 'active' : 'text-white'}`}
                  onClick={() => setActiveTab('multi')}
                >
                  <i className="bi bi-collection me-2"></i>Multi Search
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'family' ? 'active' : 'text-white'}`}
                  onClick={() => setActiveTab('family')}
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
                    <img src={logo} alt="Pixel Privacy" height="120" className="mb-4" />
                    <h1 className="text-white mb-4 gradient-text">Welcome to Pixel Privacy</h1>
                    <p className="lead text-white-50 mb-5">
                      Protect your digital identity by discovering if your personal information has been exposed online.
                    </p>
                    
                    <div className="row g-4 mb-5">
                      <div className="col-md-4">
                        <div className="card bg-dark border-light h-100">
                          <div className="card-body text-center">
                            <i className="bi bi-search text-primary mb-3" style={{fontSize: '3rem'}}></i>
                            <h5 className="text-white">Single Search</h5>
                            <p className="card-text text-white-50">Check individual PII exposure</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card bg-dark border-light h-100">
                          <div className="card-body text-center">
                            <i className="bi bi-collection text-success mb-3" style={{fontSize: '3rem'}}></i>
                            <h5 className="text-white">Multi Search</h5>
                            <p className="card-text text-white-50">Batch check multiple PII entries</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card bg-dark border-light h-100">
                          <div className="card-body text-center">
                            <i className="bi bi-people text-warning mb-3" style={{fontSize: '3rem'}}></i>
                            <h5 className="text-white">Family Search</h5>
                            <p className="card-text text-white-50">Check family members' data</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="btn btn-outline-light btn-lg"
                      onClick={() => setActiveTab('single')}
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
      </div>

      {/* Footer */}
      <footer className="bg-dark border-top border-light mt-auto py-3">
        <div className="container text-center">
          <p className="text-white mb-0">
            <i className="bi bi-shield-lock me-2"></i>
            &copy; 2025 Pixel Privacy - Protecting Your Digital Identity
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
