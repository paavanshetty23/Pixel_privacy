import React, { useState } from 'react';
import axios from 'axios';

function FamilySearch() {
  const [members, setMembers] = useState([{ name: '', type: '', value: '' }]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleChange = (idx, field, val) => {
    const newMembers = [...members];
    newMembers[idx][field] = val;
    setMembers(newMembers);
  };

  const addMember = () => setMembers([...members, { name: '', type: '', value: '' }]);
  const removeMember = idx => setMembers(members.filter((_, i) => i !== idx));

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSearchAttempted(true);
    setResults([]);
    const allResults = [];

    for (const member of members) {
      if (!member.name || !member.type || !member.value) continue;

      try {
        const response = await axios.get('http://localhost:5040/api/get-exposed-websites', {
          params: {
            name: member.name,
            'pii-type': member.type,
            'pii-value': member.value
          }
        });

        const data = response.data;
        if (data && data.neighbors) {
          allResults.push({ 
            member: member.name, 
            query: data.query, 
            websites: data.neighbors 
          });
        } else {
          allResults.push({ 
            member: member.name, 
            query: `${member.type} ${member.value}`, 
            websites: [] 
          });
        }
      } catch (error) {
        console.error(`Error searching for ${member.name}:`, error);
        allResults.push({ 
          member: member.name, 
          query: `${member.type} ${member.value}`, 
          error: error.message 
        });
      }
    }

    setResults(allResults);
    setIsLoading(false);
  };
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-10 mx-auto">
          <div className="card bg-dark border-light mb-4">
            <div className="card-header bg-dark border-light">
              <h4 className="text-white mb-0">
                <i className="bi bi-people me-2"></i>
                Family PII Exposure Search
              </h4>
              <small className="text-white-50">Check if your family members' personal information is exposed online</small>
            </div>
            <div className="card-body">
              <form onSubmit={handleSearch}>
                {members.map((member, idx) => (
                  <div key={idx} className="card bg-dark border-secondary mb-3">
                    <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center">
                      <span className="text-white">
                        <i className="bi bi-person me-2"></i>
                        Family Member {idx + 1}
                      </span>
                      {members.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeMember(idx)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label text-white">
                            <i className="bi bi-person-badge me-2"></i>
                            Name
                          </label>
                          <input
                            type="text"
                            className="form-control bg-dark text-white border-light"
                            value={member.name}
                            onChange={e => handleChange(idx, 'name', e.target.value)}
                            placeholder="Enter family member's name"
                            required
                          />
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label text-white">
                            <i className="bi bi-shield-exclamation me-2"></i>
                            PII Type
                          </label>
                          <select
                            className="form-select bg-dark text-white border-light"
                            value={member.type}
                            onChange={e => {
                              handleChange(idx, 'type', e.target.value);
                              handleChange(idx, 'value', '');
                            }}
                            required
                          >
                            <option value="">Select PII Type</option>
                            <option value="AADHAR">🆔 Aadhar</option>
                            <option value="PAN">📄 PAN</option>
                            <option value="PASSPORT">🛂 Passport</option>
                          </select>
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label text-white">
                            <i className="bi bi-key me-2"></i>
                            {member.type || 'PII Value'}
                          </label>
                          <input
                            type="text"
                            className="form-control bg-dark text-white border-light"
                            value={member.value}
                            onChange={e => handleChange(idx, 'value', e.target.value)}
                            placeholder={
                              member.type === 'AADHAR' ? 'Enter Aadhar Number (e.g., 1234 5678 9012)' :
                              member.type === 'PAN' ? 'Enter PAN Number (e.g., ABCDE1234F)' :
                              member.type === 'PASSPORT' ? 'Enter Passport ID (e.g., A-1234567)' :
                              'Enter PII value'
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={addMember}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Family Member
                    </button>
                  </div>
                  <div className="col-md-6 text-end">
                    <button 
                      type="submit" 
                      disabled={isLoading} 
                      className="btn btn-outline-light btn-lg"
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Searching...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search me-2"></i>
                          Search Family PII
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {searchAttempted && results.length > 0 && (
        <div className="row">
          <div className="col-md-10 mx-auto">
            <div className="card bg-dark border-light">
              <div className="card-header bg-dark border-light">
                <h4 className="text-white mb-0">
                  <i className="bi bi-clipboard-data me-2"></i>
                  Family Search Results
                </h4>
              </div>
              <div className="card-body">
                {results.map((result, idx) => (
                  <div key={idx} className="card bg-dark border-secondary mb-4">
                    <div className="card-header bg-dark border-secondary">
                      <h5 className="text-white mb-0">
                        <i className="bi bi-person me-2"></i>
                        {result.member}
                      </h5>
                      <small className="text-white-50">Query: {result.query}</small>
                    </div>
                    <div className="card-body">
                      {result.error ? (
                        <div className="alert alert-danger border-light">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Error: {result.error}
                        </div>
                      ) : result.websites && result.websites.length > 0 ? (
                        <div>
                          <div className="alert alert-warning border-light mb-3">
                            <h6 className="alert-heading">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              {result.websites.length} Exposure(s) Found
                            </h6>
                          </div>
                          
                          {result.websites.map((item, itemIdx) => (
                            <div key={itemIdx} className="card bg-dark border-warning mb-3">
                              <div className="card-header bg-dark border-warning d-flex justify-content-between align-items-center">
                                <span className={`badge ${item.pii_type === 'AADHAR' ? 'bg-danger' : item.pii_type === 'PAN' ? 'bg-warning' : 'bg-info'}`}>
                                  {item.pii_type || 'Unknown'}
                                </span>
                                <span className="text-white-50">
                                  Match Score: <strong className="text-white">{item.distance ? ((1 - item.distance) * 100).toFixed(2) : 'N/A'}%</strong>
                                </span>
                              </div>
                              <div className="card-body">
                                <div className="row">
                                  <div className="col-md-6">
                                    <p className="text-white mb-2">
                                      <strong>Exposed Data:</strong><br />
                                      <span className="badge bg-danger">{item.data || 'N/A'}</span>
                                    </p>
                                  </div>
                                  <div className="col-md-6">
                                    <p className="text-white mb-2">
                                      <strong>Website:</strong><br />
                                      <a 
                                        href={item.website && item.website.startsWith('http') ? item.website : `https://${item.website || ''}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-light btn-sm"
                                      >
                                        <i className="bi bi-box-arrow-up-right me-1"></i>
                                        {item.website || 'Unknown'}
                                      </a>
                                    </p>
                                  </div>
                                </div>
                                <p className="text-white-50 mb-0">
                                  <strong>Detected On:</strong> {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Unknown'}
                                  {item.found_in_image && (
                                    <span className="badge bg-info ms-2">Found in Image</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-success border-light">
                          <h6 className="alert-heading">
                            <i className="bi bi-check-circle me-2"></i>
                            Good News!
                          </h6>
                          <p className="mb-0">No exposed PII found for {result.member}.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="card bg-dark border-info mt-4">
                  <div className="card-header bg-dark border-info">
                    <h5 className="text-white mb-0">
                      <i className="bi bi-lightbulb me-2"></i>
                      Family Protection Recommendations
                    </h5>
                  </div>
                  <div className="card-body">
                    <ul className="text-white">
                      <li className="mb-2">Educate family members about PII protection</li>
                      <li className="mb-2">Regularly monitor family members' digital footprint</li>
                      <li className="mb-2">Set up identity theft monitoring for the family</li>
                      <li className="mb-2">Create strong, unique passwords for all family accounts</li>
                      <li>Enable two-factor authentication for family members</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilySearch;
