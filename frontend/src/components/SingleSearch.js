import React, { useState } from 'react';

function SingleSearch() {
  const [piiType, setPiiType] = useState('');
  const [piiValue, setPiiValue] = useState('');
  const [websites, setWebsites] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    setWebsites([
      'https://leaksite1.com',
      'https://sample-data.net',
      'https://testpii.io',
    ]);
  };

  return (
    <div className="pii-search-container">
      <form className="pii-form" onSubmit={handleSearch}>
        <div>
          <label><b>Type of PII</b></label>
          <select value={piiType} onChange={e => setPiiType(e.target.value)} required>
            <option value="">Select</option>
            <option value="Aadhar Number">Aadhar</option>
            <option value="PAN Number">PAN</option>
            <option value="Passport ID">Passport</option>
            <option value="PII value">Other</option>
          </select>
        </div>
        <div>
          <label><b>{piiType ? piiType : 'PII Value'}</b></label>
          <input
            type="text"
            value={piiValue}
            onChange={e => setPiiValue(e.target.value)}
            placeholder={
              piiType === 'Aadhar Number' ? 'Enter Aadhar Number' :
              piiType === 'PAN Number' ? 'Enter PAN Number' :
              piiType === 'Passport ID' ? 'Enter Passport ID' :
              'Enter PII value'
            }
            required
          />
        </div>
        <button type="submit">Search</button>
        {websites.length > 0 && (
          <div className="result-box">
            <h3>Exposed Websites:</h3>
            <ul>
              {websites.map((site, idx) => (
                <li key={idx}><a href={site} target="_blank" rel="noopener noreferrer">{site}</a></li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}

export default SingleSearch;
