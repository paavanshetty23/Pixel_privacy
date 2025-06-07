import React, { useState } from 'react';
import '../styles/tabs.css';
import '../styles/home.css';
import HomePage from './HomePage';
import SingleSearch from './SingleSearch';
import MultiSearch from './MultiSearch';
import FamilySearch from './FamilySearch';

const tabList = [
  { label: 'Home', key: 'home' },
  { label: 'Single Search', key: 'single' },
  { label: 'Multi Search', key: 'multi' },
  { label: 'Family Search', key: 'family' },
];

function Tabs({ activeTab }) {
  // Render HomePage without wrapper
  if (activeTab === 'home') {
    return <HomePage />;
  }
  // Wrap other tabs in card styling
  return (
    <div className="Tabs">
      <div className="tab-content">
        {activeTab === 'single' && <SingleSearch />}
        {activeTab === 'multi' && <MultiSearch />}
        {activeTab === 'family' && <FamilySearch />}
      </div>
    </div>
  );
}

export default Tabs;
