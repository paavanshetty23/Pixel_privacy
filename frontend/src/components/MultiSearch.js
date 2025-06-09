import React, { useState } from 'react';

function MultiSearch() {
  const [piis, setPiis] = useState([{ type: '', value: '' }]);
  const [websites, setWebsites] = useState([]);

  const handleChange = (idx, field, val) => {
    const newPiis = [...piis];
    newPiis[idx][field] = val;
    setPiis(newPiis);
  };

  const addField = () => setPiis([...piis, { type: '', value: '' }]);
  const removeField = idx => setPiis(piis.filter((_, i) => i !== idx));

  const handleSearch = (e) => {
    e.preventDefault();
    setWebsites([
      'https://multi-leak1.com',
      'https://multi-leak2.com',
    ]);
  };

  return (
    <div className="pii-search-container">
      <form className="pii-form" onSubmit={handleSearch}>
        {piis.map((pii, idx) => (
          <div key={idx} className="pii-field-group">
            <div style={{ flex: 1 }}>
              <select value={pii.type} onChange={e => handleChange(idx, 'type', e.target.value)} required>
                <option value="">Type</option>
                <option value="Aadhar Number">Aadhar</option>
                <option value="PAN Number">PAN</option>
                <option value="Passport ID">Passport</option>
                <option value="PII value">Other</option>
              </select>
            </div>
            <div style={{ flex: 1.5 }}>
              <input
                type="text"
                value={pii.value}
                onChange={e => handleChange(idx, 'value', e.target.value)}
                placeholder={
                  pii.type === 'Aadhar Number' ? 'Enter Aadhar Number' :
                  pii.type === 'PAN Number' ? 'Enter PAN Number' :
                  pii.type === 'Passport ID' ? 'Enter Passport ID' :
                  'Enter PII value'
                }
                required
              />
            </div>
            {piis.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeField(idx)}
                className="remove-btn"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <div>
          <button type="button" onClick={addField}>Add More</button>
          <button type="submit">Search</button>
        </div>
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

export default MultiSearch;
