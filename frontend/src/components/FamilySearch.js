import React, { useState } from 'react';

function FamilySearch() {
  const [members, setMembers] = useState([{ name: '', type: '', value: '' }]);
  const [websites, setWebsites] = useState([]);

  const handleChange = (idx, field, val) => {
    const newMembers = [...members];
    newMembers[idx][field] = val;
    setMembers(newMembers);
  };

  const addMember = () => setMembers([...members, { name: '', type: '', value: '' }]);
  const removeMember = idx => setMembers(members.filter((_, i) => i !== idx));

  const handleSearch = (e) => {
    e.preventDefault();
    setWebsites([
      'https://family-leak1.com',
      'https://family-leak2.com',
    ]);
  };

  return (
    <div className="pii-search-container">
      <form className="pii-form" onSubmit={handleSearch}>
        {members.map((member, idx) => (
          <div key={idx} className="pii-field-group">
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={member.name}
                onChange={e => handleChange(idx, 'name', e.target.value)}
                placeholder="Member Name"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <select value={member.type} onChange={e => handleChange(idx, 'type', e.target.value)} required>
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
                value={member.value}
                onChange={e => handleChange(idx, 'value', e.target.value)}
                placeholder={
                  member.type === 'Aadhar Number' ? 'Enter Aadhar Number' :
                  member.type === 'PAN Number' ? 'Enter PAN Number' :
                  member.type === 'Passport ID' ? 'Enter Passport ID' :
                  'Enter PII value'
                }
                required
              />
            </div>
            {members.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeMember(idx)}
                className="remove-btn"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <div>
          <button type="button" onClick={addMember}>Add Member</button>
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

export default FamilySearch;
