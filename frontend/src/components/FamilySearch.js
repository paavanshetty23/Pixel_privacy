import React, { useState } from 'react';
import '../styles/SearchResults.css'; // Import the CSS file

function FamilySearch() {
  const [piiType, setPiiType] = useState('');
  const [piiValue, setPiiValue] = useState('');
  const [websites, setWebsites] = useState([]);
  const [members, setMembers] = useState([{ name: '', type: '', value: '' }]);

  const handleChange = (idx, field, val) => {
    const newMembers = [...members];
    newMembers[idx][field] = val;
    setMembers(newMembers);
  };

  const addMember = () => setMembers([...members, { name: '', type: '', value: '' }]);
  const removeMember = idx => setMembers(members.filter((_, i) => i !== idx));

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/search_family_pii', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ piiType, piiValue }),
      });

      if (!response.ok) {
        console.error('Backend search failed:', response.status, response.statusText);
        setWebsites([]);
        return;
      }

      const data = await response.json();
      if (data && data.neighbors) {
        setWebsites(data.neighbors);
      } else {
        setWebsites([]);
        console.log('No neighbors found or unexpected response structure:', data);
      }
    } catch (error) {
      console.error('Error during PII search:', error);
      setWebsites([]);
    }
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
        <button type="submit">Search Family PII</button>
        {websites.length > 0 ? (
          <div className="result-box">
            <h3>Exposed Websites:</h3>
            <ul className="exposed-list">
              {websites.map((site, idx) => (
                <li key={idx} className="exposed-list-item">
                  <a href={site} target="_blank" rel="noopener noreferrer" className="exposed-link">{site}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="no-websites-found">No exposed websites found for this query.</div>
        )}
      </form>
    </div>
  );
}

export default FamilySearch;
