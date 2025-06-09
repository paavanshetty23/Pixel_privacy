import React, { useState } from 'react';
import Tabs from './components/Tabs';
import './styles/theme.css';
import logo from './logo.png';

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
        <Tabs activeTab={activeTab} />
      </div>
    </div>
  );
}

export default App;
