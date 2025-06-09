import React, { useState } from 'react';
import '../styles/SearchResults.css'; // Import the CSS file

function MultiSearch() {
  const [searchQueries, setSearchQueries] = useState([{ piiType: '', piiValue: '' }]);
  const [results, setResults] = useState([]); // To store results for multiple queries

  const handleQueryChange = (index, field, value) => {
    const newQueries = [...searchQueries];
    newQueries[index][field] = value;
    setSearchQueries(newQueries);
  };

  const addQueryField = () => {
    setSearchQueries([...searchQueries, { piiType: '', piiValue: '' }]);
  };

  const removeQueryField = (index) => {
    const newQueries = searchQueries.filter((_, i) => i !== index);
    setSearchQueries(newQueries);
  };

  const handleMultiSearch = async (e) => {
    e.preventDefault();
    // You'll need to decide how to handle multiple API calls:
    // 1. Send all queries in one request (if backend supports it)
    // 2. Send multiple requests in parallel
    setResults([]); // Clear previous results
    const allResults = [];

    for (const query of searchQueries) {
      if (!query.piiType || !query.piiValue) continue; // Skip empty queries

      try {
        const response = await fetch('/api/search_pii', { // Assuming same endpoint, or a new one for multi-search
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(query), // Send individual query object
        });

        if (!response.ok) {
          console.error(`Backend search failed for query ${JSON.stringify(query)}:`, response.status, response.statusText);
          allResults.push({ query, error: `HTTP error! status: ${response.status}` });
          continue;
        }

        const data = await response.json();
        if (data && data.neighbors) {
          allResults.push({ query: data.query, websites: data.neighbors });
        } else {
          allResults.push({ query: query.piiValue, websites: [], message: 'No neighbors found or unexpected response.' });
          console.log(`No neighbors found for query ${query.piiValue} or unexpected response structure:`, data);
        }
      } catch (error) {
        console.error(`Error during PII search for query ${JSON.stringify(query)}:`, error);
        allResults.push({ query, error: error.toString() });
      }
    }
    setResults(allResults);
  };

  return (
    <div className="pii-search-container multi-search-container">
      <form className="pii-form" onSubmit={handleMultiSearch}>
        {searchQueries.map((query, index) => (
          <div key={index} className="query-group">
            <select value={query.piiType} onChange={e => handleQueryChange(index, 'piiType', e.target.value)} required>
              <option value="">Select PII Type</option>
              <option value="Aadhar Number">Aadhar</option>
              <option value="PAN Number">PAN</option>
              <option value="Passport ID">Passport</option>
              <option value="PII value">Other</option>
            </select>
            <input
              type="text"
              value={query.piiValue}
              onChange={e => handleQueryChange(index, 'piiValue', e.target.value)}
              placeholder={`Enter ${query.piiType || 'PII'} Value`}
              required
            />
            {searchQueries.length > 1 && (
              <button type="button" onClick={() => removeQueryField(index)} className="remove-query-btn">
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addQueryField} className="add-query-btn">Add another PII</button>
        <button type="submit">Search All</button>

        {results.length > 0 && (
          <div className="multi-result-box">
            <h3>Search Results:</h3>
            {results.map((result, idx) => (
              <div key={idx} className="result-item">
                <h4 className="result-query-title">Query: {typeof result.query === 'object' ? `${result.query.piiType} - ${result.query.piiValue}` : result.query}</h4>
                {result.error && <p className="error-message">Error: {result.error}</p>}
                {result.websites && result.websites.length > 0 ? (
                  <ul className="exposed-list">
                    {result.websites.map((site, siteIdx) => (
                      <li key={siteIdx} className="exposed-list-item">
                        <a href={site} target="_blank" rel="noopener noreferrer" className="exposed-link">{site}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  !result.error && <p className="no-results-message">No exposed websites found for this query.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

export default MultiSearch;
