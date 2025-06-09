import React, { useState } from 'react';
import Tabs from './components/Tabs';
import './styles/theme.css';
import logo from './logo.png';
import SingleSearch from './components/SingleSearch';
import FamilySearch from './components/FamilySearch';
import MultiSearch from './components/MultiSearch';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  return (
    <div className="app-bg">
      <div className="app-header">
        <img src={logo} className="app-logo" alt="Pixel Privacy Logo" />
        <ul className="nav header-nav">
          {['home','single','multi','family'].map((key,index)=>(
            <li key={key} className={activeTab===key?'active':''} onClick={()=>setActiveTab(key)}>
              {['Home','Single Search','Multi Search','Family Search'][index]}
            </li>
          ))}
        </ul>
      </div>
      <div className="container">
        {activeTab === 'home' && <Tabs activeTab={activeTab} />}
        {activeTab === 'single' && (
          <section>
            <h2>Single PII Search</h2>
            <SingleSearch />
          </section>
        )}
        {activeTab === 'multi' && (
          <section>
            <h2>Multi PII Search</h2>
            <MultiSearch />
          </section>
        )}
        {activeTab === 'family' && (
          <section>
            <h2>Family PII Search</h2>
            <FamilySearch />
          </section>
        )}
      </div>
      <footer>
        <p>&copy; 2025 Pixel Privacy</p>
      </footer>
    </div>
  );
}

export default App;
