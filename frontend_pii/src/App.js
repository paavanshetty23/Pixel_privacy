import React from 'react';
import PiiSearch from './components/Piisearch';
import './styles/Piisearch.css';

const App = () => {
  return (
    <div className="app-container">
      <h1 className="main-title"> Pixel Privacy</h1>
      <PiiSearch />
    </div>
  );
};

export default App;
