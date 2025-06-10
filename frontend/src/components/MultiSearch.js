import React, { useState } from 'react';
import axios from 'axios';

function MultiSearch() {
  const [searchQueries, setSearchQueries] = useState([{ piiType: '', piiValue: '' }]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    setResults([]);
    const allResults = [];

    for (const query of searchQueries) {
      if (!query.piiType || !query.piiValue) continue;

      try {
        const response = await axios.get('http://localhost:5040/api/get-exposed-websites', {
          params: {
            name: `Multi-Search-${query.piiType}`,
            'pii-type': query.piiType,
            'pii-value': query.piiValue
          }
        });

        const data = response.data;
        if (data && data.neighbors) {
          allResults.push({ query: data.query, websites: data.neighbors });
        } else {
          allResults.push({ query: `${query.piiType} ${query.piiValue}`, websites: [] });
        }
      } catch (error) {
        console.error(`Error searching for ${query.piiType}: ${query.piiValue}`, error);
        allResults.push({ query: `${query.piiType} ${query.piiValue}`, error: error.message });
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
                <i className="bi bi-collection me-2"></i>
                Multi PII Search
              </h4>
              <small className="text-white-50">Search for multiple PII entries at once</small>
            </div>
            <div className="card-body">
              <form onSubmit={handleMultiSearch}>
                {searchQueries.map((query, index) => (
                  <div key={index} className="row g-3 mb-3 p-3 border border-light rounded">
                    <div className="col-md-5">
                      <label className="form-label text-white">
                        <i className="bi bi-shield-exclamation me-2"></i>
                        PII Type {index + 1}
                      </label>
                      <select
                        className="form-select bg-dark text-white border-light"
                        value={query.piiType}
                        onChange={e => handleQueryChange(index, 'piiType', e.target.value)}
                        required
                      >
                        <option value="">Select PII Type</option>
                        <option value="AADHAR">🆔 Aadhar</option>
                        <option value="PAN">📄 PAN</option>
                        <option value="PASSPORT">🛂 Passport</option>
                      </select>
                    </div>
                    
                    <div className="col-md-5">
                      <label className="form-label text-white">
                        <i className="bi bi-key me-2"></i>
                        {query.piiType || 'PII Value'} {index + 1}
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-light"
                        value={query.piiValue}
                        onChange={e => handleQueryChange(index, 'piiValue', e.target.value)}
                        placeholder={
                          query.piiType === 'AADHAR' ? 'Enter Aadhar Number' :
                          query.piiType === 'PAN' ? 'Enter PAN Number' :
                          query.piiType === 'PASSPORT' ? 'Enter Passport ID' :
                          'Enter PII value'
                        }
                        required
                      />
                    </div>
                    
                    <div className="col-md-2 d-flex align-items-end">
                      {searchQueries.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeQueryField(index)}
                          className="btn btn-outline-danger btn-sm w-100"
                        >
                          <i className="bi bi-trash me-1"></i>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="d-flex gap-2 mb-4">
                  <button 
                    type="button" 
                    onClick={addQueryField}
                    className="btn btn-outline-secondary"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Another PII
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="btn btn-outline-light btn-lg flex-grow-1"
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Searching...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2"></i>
                        Search All PIIs
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="row">
          <div className="col-md-10 mx-auto">
            <div className="card bg-dark border-light">
              <div className="card-header bg-dark border-light">
                <h4 className="text-white mb-0">
                  <i className="bi bi-clipboard-data me-2"></i>
                  Multi-Search Results
                </h4>
              </div>
              <div className="card-body">
                {results.map((result, idx) => (
                  <div key={idx} className="card bg-dark border-warning mb-3">
                    <div className="card-header bg-dark border-warning">
                      <h5 className="text-white mb-0">Query: {result.query}</h5>
                    </div>
                    <div className="card-body">
                      {result.error ? (
                        <div className="alert alert-danger">
                          <strong>Error:</strong> {result.error}
                        </div>
                      ) : result.websites && result.websites.length > 0 ? (
                        <div>
                          <h6 className="text-white mb-3">Found {result.websites.length} exposed instances:</h6>
                          {result.websites.map((item, siteIdx) => (
                            <div key={siteIdx} className="card bg-dark border-light mb-2">
                              <div className="card-body">
                                <div className="row">
                                  <div className="col-md-6">
                                    <strong className="text-white">Data:</strong>
                                    <span className="badge bg-danger ms-2">{item.data || 'N/A'}</span>
                                  </div>
                                  <div className="col-md-6">
                                    <strong className="text-white">Website:</strong>
                                    <a 
                                      href={item.website && item.website.startsWith('http') ? item.website : `https://${item.website || ''}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-light btn-sm ms-2"
                                    >
                                      <i className="bi bi-box-arrow-up-right me-1"></i>
                                      {item.website || 'Unknown'}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          No exposed websites found for this query.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSearch;
