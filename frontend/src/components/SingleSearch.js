import React, { useState } from 'react';
import axios from 'axios';

function SingleSearch() {
  const [name, setName] = useState('');
  const [piiType, setPiiType] = useState('');
  const [piiValue, setPiiValue] = useState('');
  const [websites, setWebsites] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handlePiiValueChange = (e) => {
    setPiiValue(e.target.value);
  };
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSearchAttempted(true);

    try {
      // Make GET request with query parameters
      const response = await axios.get(`http://localhost:5040/api/get-exposed-websites?name=${name}&pii-type=${piiType}&pii-value=${piiValue}`);

      const data = response.data;
      setSearchResults(data);
      if (data.neighbors) {
        const extractedWebsites = data.neighbors.map(item => item.website);
        setWebsites(extractedWebsites);
      } else {
        setWebsites([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setWebsites([]);
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card bg-dark border-light mb-4">
            <div className="card-header bg-dark border-light">
              <h4 className="text-white mb-0">
                <i className="bi bi-person-badge me-2"></i>
                PII Exposure Search
              </h4>
              <small className="text-white-50">Check if your personal information is exposed on the internet</small>
            </div>
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label text-white">
                      <i className="bi bi-person me-2"></i>
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-light"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-white">
                      <i className="bi bi-shield-exclamation me-2"></i>
                      Type of PII
                    </label>
                    <select
                      className="form-select bg-dark text-white border-light"
                      value={piiType}
                      onChange={e => {
                        setPiiType(e.target.value);
                        setPiiValue('');
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
                      {piiType || 'PII Value'}
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-light"
                      value={piiValue}
                      onChange={handlePiiValueChange}
                      placeholder={
                        piiType === 'AADHAR' ? 'Enter Aadhar Number (e.g., 1234 5678 9012)' :
                          piiType === 'PAN' ? 'Enter PAN Number (e.g., ABCDE1234F)' :
                            piiType === 'PASSPORT' ? 'Enter Passport ID (e.g., A-1234567)' :
                              'Enter PII value'
                      }
                      required
                    />
                  </div>
                </div>

                <div className="d-grid gap-2 mt-4">
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
                        Search for Exposure
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {searchAttempted && (
        <div className="row">
          <div className="col-md-10 mx-auto">
            {websites.length > 0 ? (
              <div className="alert alert-warning border-light">
                <h5 className="alert-heading">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Exposed Websites Found
                </h5>
                <ul className="list-unstyled mb-0">
                  {websites.map((site, idx) => (
                    <li key={idx} className="mb-1">
                      <i className="bi bi-link-45deg me-2"></i>
                      <a href={site} target="_blank" rel="noopener noreferrer" className="text-dark">
                        {site}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="alert alert-success border-light">
                <h5 className="alert-heading">
                  <i className="bi bi-check-circle me-2"></i>
                  Good News!
                </h5>
                <p className="mb-0">No exposed websites found for this query. Your data appears to be safe.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {searchResults && (
        <div className="row">
          <div className="col-md-10 mx-auto">
            <div className="card bg-dark border-light">
              <div className="card-header bg-dark border-light">
                <h4 className="text-white mb-0">
                  <i className="bi bi-clipboard-data me-2"></i>
                  Search Results
                </h4>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong className="text-white">Searched for:</strong>
                    <span className="badge bg-primary ms-2">{searchResults.query}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="text-white">Name:</strong>
                    <span className="badge bg-secondary ms-2">{name}</span>
                  </div>
                </div>

                {searchResults.neighbors && searchResults.neighbors.length > 0 ? (
                  <div className="results-container">
                    <div className="row mb-4">
                      <div className="col-md-8">
                        <h5 className="text-white">
                          Found {searchResults.neighbors.length} exposed instances
                        </h5>
                        <p className="text-white-50">
                          Your information was detected on {new Set(searchResults.neighbors.map(item => item.website)).size} websites
                        </p>
                      </div>
                      <div className="col-md-4">
                        <RiskIndicator count={searchResults.neighbors.length} />
                      </div>
                    </div>

                    {searchResults.neighbors.map((item, idx) => (
                      <div key={idx} className="card bg-dark border-warning mb-3">
                        <div className="card-header bg-dark border-warning d-flex justify-content-between align-items-center">
                          <span className={`badge ${item.pii_type === 'AADHAR' ? 'bg-danger' : item.pii_type === 'PAN' ? 'bg-warning' : 'bg-info'}`}>
                            {item.pii_type || 'Unknown'}
                          </span>
                          <span className="text-white-50">
                            Distance Score: <strong className="text-white">{item.distance ? item.distance.toFixed(2) : 0}</strong>
                          </span>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <p className="text-white mb-2">
                                <strong>Data Found:</strong><br />
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
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="card bg-dark border-info mt-4">
                      <div className="card-header bg-dark border-info">
                        <h5 className="text-white mb-0">
                          <i className="bi bi-lightbulb me-2"></i>
                          Recommended Actions
                        </h5>
                      </div>
                      <div className="card-body">
                        <ul className="text-white">
                          <li className="mb-2">Contact website administrators for data removal</li>
                          <li className="mb-2">Update your credentials if exposed</li>
                          <li className="mb-2">Monitor accounts for suspicious activities</li>
                          <li>Enable two-factor authentication</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="text-success mb-3" style={{ fontSize: '4rem' }}>
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <h4 className="text-white">Great news! No exposed PII found.</h4>
                    <p className="text-white-50">Your personal information appears to be safe.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RiskIndicator({ count }) {
  let riskLevel = "Low";
  let riskColor = "#28a745";
  let riskIcon = "bi-check-circle";

  if (count === 0) {
    riskLevel = "None";
    riskColor = "#28a745";
    riskIcon = "bi-shield-check";
  } else if (count <= 2) {
    riskLevel = "Moderate";
    riskColor = "#ffc107";
    riskIcon = "bi-exclamation-triangle";
  } else {
    riskLevel = "High";
    riskColor = "#dc3545";
    riskIcon = "bi-exclamation-octagon";
  }

  const riskPercentage = count === 0 ? 0 : count <= 2 ? 50 : 100;

  return (
    <div className="card bg-dark border-light">
      <div className="card-body text-center">
        <h6 className="text-white">Risk Level</h6>
        <div className="progress mb-3" style={{ height: '8px' }}>
          <div
            className="progress-bar"
            style={{ width: `${riskPercentage}%`, backgroundColor: riskColor }}
          ></div>
        </div>
        <div className="d-flex align-items-center justify-content-center">
          <i className={`${riskIcon} me-2`} style={{ color: riskColor }}></i>
          <span className="badge" style={{ backgroundColor: riskColor }}>
            {riskLevel}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SingleSearch;
