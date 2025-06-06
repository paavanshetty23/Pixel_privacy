import React, { useState } from 'react';
import '../styles/Piisearch.css';


const PiiSearch = () => {
  const [piiType, setPiiType] = useState('');
  const [piiValue, setPiiValue] = useState('');
  const [websites, setWebsites] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();

    // Simulate backend scan
    const mockResults = [
      'https://leaksite1.com',
      'https://sample-data.net',
      'https://testpii.io'
    ];
    setWebsites(mockResults);
  };

  return (
    <div className='wholeapp'>
    <div className="pii-search-container">
      <form className="pii-form" onSubmit={handleSearch}>
        <label><b>Type of PII</b></label>
        <select value={piiType} onChange={(e) => setPiiType(e.target.value)} required>
          <option value="">Select</option>
          <option value="Aadhar Number">Aadhar</option>
          <option value="PAN Number">PAN</option>
          <option value="Passport ID">Passport</option>
          <option value="PII value">other</option>
        </select>

        
       <label><b>
  {piiType
    ? `${piiType}`
    : 'PII Value'}</b>
</label>
<input
  type="text"
  value={piiValue}
  onChange={(e) => setPiiValue(e.target.value)}
  placeholder={
    piiType === 'Aadhar Number'
      ? 'Enter Aadhar Number'
      : piiType === 'PAN Number'
      ? 'Enter PAN Number'
      : piiType === 'Passport ID'
      ? 'Enter Passport ID'
      : 'Enter PII value'
  }
  required
/>



        <button type="submit">Search</button>
      </form>
      </div>
      {websites.length > 0 && (
        <div className="result-box">
          <h3>Exposed Websites:</h3>
          <ul >
            {websites.map((site, idx) => (
              <li key={idx}><a href={site} target="_blank" rel="noopener noreferrer">{site}</a></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PiiSearch;
