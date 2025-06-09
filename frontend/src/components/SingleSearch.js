import React, { useState } from 'react';

function SingleSearch() {
  const [name, setName] = useState('');
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
      <div className="pii-search-header">
        <h2>PII Exposure Search</h2>
        <p className="description">
          Check if your personal information is exposed on the internet
        </p>
      </div>
      
      <form className="pii-form" onSubmit={handleSearch}>
        <div className="form-row">
          <div className="form-group">
            <label><b>Your Name</b></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label><b>Type of PII</b></label>
            <select 
              value={piiType} 
              onChange={e => {
                setPiiType(e.target.value);
                setPiiValue(''); // Reset PII value when type changes
              }} 
              required
              className="form-select"
            >
              <option value="">Select PII Type</option>
              <option value="AADHAR">Aadhar</option>
              <option value="PAN">PAN</option>
              <option value="PASSPORT">Passport</option>
            </select>
          </div>
          
          <div className="form-group">
            <label><b>{piiType || 'PII Value'}</b></label>
            <input
              type="text"
              value={piiValue}
              onChange={handlePiiValueChange}
              placeholder={
                piiType === 'AADHAR' ? 'Enter Aadhar Number (e.g., 1234 5678 9012)' :
                piiType === 'PAN' ? 'Enter PAN Number (e.g., ABCDE1234F)' :
                piiType === 'PASSPORT' ? 'Enter Passport ID (e.g., A-1234567)' :
                'Enter PII value'
              }
              pattern={
                piiType === 'AADHAR' ? '\\d{4}\\s\\d{4}\\s\\d{4}' :
                piiType === 'PAN' ? '[A-Z]{5}[0-9]{4}[A-Z]{1}' :
                piiType === 'PASSPORT' ? '[A-Z]{1}-?\\d{7}' :
                null
              }
              required
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={isLoading} className="search-button">
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
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
        ) : (
          // Optional: Message when no websites are found and no error occurred
          // Check if a search has been attempted to avoid showing this on initial load
          // For simplicity, this example shows it if websites array is empty after a search attempt might have occurred.
          // You might need a separate state variable like `searchAttempted` for more precise control.
          <div className="no-websites-found">No exposed websites found for this query.</div>
        )}
      </form>
        
      {searchResults && (
        <div className="pii-results">
          <h3>Search Results</h3>
          <div className="query-info">
            <p>
              <strong>Searched for:</strong> 
              <span className="search-query">{searchResults.query}</span>
            </p>
            <p>
              <strong>Name:</strong> 
              <span className="search-name">{name}</span>
            </p>
          </div>
          
          {searchResults.neighbors && searchResults.neighbors.length > 0 ? (
            <div className="results-container">
              <div className="results-summary">
                <div className="summary-text">
                  <h4>Found {searchResults.neighbors.length} exposed {searchResults.neighbors.length === 1 ? 'instance' : 'instances'}</h4>
                  <p className="summary-description">
                    We detected your personal information on {new Set(searchResults.neighbors.map(item => item.website)).size} {new Set(searchResults.neighbors.map(item => item.website)).size === 1 ? 'website' : 'websites'}
                  </p>
                </div>
                <RiskIndicator count={searchResults.neighbors.length} />
              </div>
              
              {searchResults.neighbors.map((item, idx) => (
                <div key={idx} className="result-card">
                  <div className="result-header">
                    <span className={`pii-badge ${item.pii_type.toLowerCase()}`}>
                      {item.pii_type}
                    </span>
                    <span className="result-score">
                      Match Score: <strong>{((1 - item.distance) * 100).toFixed(2)}%</strong>
                    </span>
                  </div>
                  <div className="result-body">
                    <p>
                      <strong>Data Found:</strong> 
                      <span className="highlight-data">{item.data}</span>
                    </p>
                    <p>
                      <strong>Website:</strong> 
                      <a 
                        href={item.website.startsWith('http') ? item.website : `https://${item.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="website-link"
                      >
                        {item.website}
                      </a>
                    </p>
                    <p>
                      <strong>Detected On:</strong> 
                      <span className="timestamp">
                        {new Date(item.timestamp).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="action-steps">
                <h4>Recommended Actions</h4>
                <ul>
                  <li>Contact the website administrators to request data removal</li>
                  <li>Consider updating your credentials if they have been exposed</li>
                  <li>Monitor your accounts for suspicious activities</li>
                  <li>Enable two-factor authentication where possible</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">✓</div>
              <h4>Great news! No exposed PII found.</h4>
              <p>Your personal information appears to be safe. Continue to monitor regularly.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component to display the exposure risk level based on match count
function RiskIndicator({ count }) {
  let riskLevel = "Low";
  let riskColor = "#40c057";
  let riskMessage = "Your exposure risk is minimal.";
  let riskIcon = "✓";
  
  if (count === 0) {
    riskLevel = "None";
    riskMessage = "No exposure detected.";
  } else if (count > 0 && count <= 2) {
    riskLevel = "Moderate";
    riskColor = "#fd7e14";
    riskMessage = "Your information has limited exposure.";
    riskIcon = "⚠";
  } else if (count > 2) {
    riskLevel = "High";
    riskColor = "#e03131";
    riskMessage = "Your information has significant exposure!";
    riskIcon = "⚠⚠";
  }
  
  // Calculate a percentage for the risk meter
  const riskPercentage = count === 0 ? 0 : count <= 2 ? 50 : 100;
  
  return (
    <div className="risk-indicator">
      <h4>Exposure Risk Level</h4>
      <div className="risk-meter-container">
        <div 
          className="risk-meter" 
          style={{ width: `${riskPercentage}%`, backgroundColor: riskColor }}
        ></div>
      </div>
      <div className="risk-details">
        <div className={`risk-level ${riskLevel.toLowerCase()}`} style={{ backgroundColor: riskColor }}>
          <span className="risk-icon">{riskIcon}</span>
          {riskLevel}
        </div>
        <p className="risk-message">{riskMessage}</p>
      </div>
    </div>
  );
}

export default SingleSearch;
