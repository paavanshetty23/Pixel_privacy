import pytest
import tempfile
import os
from unittest.mock import Mock, patch, MagicMock
import numpy as np
from app import PIIDetector, app

class TestPIIDetector:
    
    @pytest.fixture
    def detector(self):
        """Create a PIIDetector instance for testing"""
        with patch.object(PIIDetector, '_load_glove_model') as mock_glove:
            mock_w2v = Mock()
            mock_w2v.vector_size = 300
            mock_w2v.__contains__ = lambda self, key: key in ['test', 'aadhar', 'pan']
            mock_w2v.__getitem__ = lambda self, key: np.random.rand(300)
            mock_glove.return_value = mock_w2v
            
            detector = PIIDetector()
            return detector
    
    def test_load_websites_success(self, detector):
        """Test successful loading of websites from file"""
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.list') as f:
            f.write("http://example1.com\n")
            f.write("http://example2.com\n")
            f.write("\n")  # Empty line should be ignored
            f.write("http://example3.com\n")
            temp_file = f.name
        
        detector.website_list_file = temp_file
        websites = detector.load_websites()
        
        assert len(websites) == 3
        assert "http://example1.com" in websites
        assert "http://example2.com" in websites
        assert "http://example3.com" in websites
        
        os.unlink(temp_file)
    
    def test_load_websites_file_not_found(self, detector):
        """Test loading websites when file doesn't exist"""
        detector.website_list_file = "nonexistent_file.list"
        websites = detector.load_websites()
        assert websites == []
    
    def test_extract_pii_from_text_valid_data(self, detector):
        """Test PII extraction from text with valid data"""
        text = """
        John's Aadhar number is 1234 5678 9012.
        His PAN card is ABCDE1234F.
        Passport number: A-1234567
        """
        
        pii_data = detector.extract_pii_from_text(text)
        
        assert "1234 5678 9012" in pii_data['AADHAR']
        assert "ABCDE1234F" in pii_data['PAN']
        assert "A-1234567" in pii_data['PASSPORT']
    
    def test_extract_pii_from_text_no_data(self, detector):
        """Test PII extraction from text with no PII data"""
        text = "This is just regular text with no sensitive information."
        
        pii_data = detector.extract_pii_from_text(text)
        
        assert len(pii_data['AADHAR']) == 0
        assert len(pii_data['PAN']) == 0
        assert len(pii_data['PASSPORT']) == 0
    
    def test_validate_pii_format_valid(self, detector):
        """Test PII format validation with valid data"""
        assert detector.validate_pii_format('AADHAR', '1234 5678 9012') == True
        assert detector.validate_pii_format('PAN', 'ABCDE1234F') == True
        assert detector.validate_pii_format('PASSPORT', 'A-1234567') == True
        assert detector.validate_pii_format('PASSPORT', 'A1234567') == True
    
    def test_validate_pii_format_invalid(self, detector):
        """Test PII format validation with invalid data - THIS TEST SHOULD FAIL"""
        # This test is designed to fail to demonstrate a failing test case
        # The regex for AADHAR expects spaces, but we're testing without spaces
        assert detector.validate_pii_format('AADHAR', '123456789012') == True  # This will fail
    
    def test_embed_text_success(self, detector):
        """Test text embedding with valid input"""
        text = "test aadhar pan"
        embedding = detector.embed_text(text)
        
        assert isinstance(embedding, list)
        assert len(embedding) == 300
        assert all(isinstance(x, (int, float)) for x in embedding)
    
    def test_embed_text_empty_input(self, detector):
        """Test text embedding with empty input"""
        embedding = detector.embed_text("")
        
        assert isinstance(embedding, list)
        assert len(embedding) == 300
        assert all(x == 0.0 for x in embedding)
    
    def test_embed_text_no_model(self):
        """Test text embedding when model is not loaded"""
        with patch.object(PIIDetector, '_load_glove_model', return_value=None):
            detector = PIIDetector()
            embedding = detector.embed_text("test text")
            
            assert isinstance(embedding, list)
            assert len(embedding) == 300
            assert all(x == 0.0 for x in embedding)

class TestFlaskAPI:
    
    @pytest.fixture
    def client(self):
        """Create Flask test client"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    @patch('app.detector')
    def test_api_missing_parameters(self, mock_detector, client):
        """Test API with missing parameters"""
        response = client.get('/api/get-exposed-websites')
        assert response.status_code == 400
        assert b'Missing required parameters' in response.data
    
    @patch('app.detector')
    def test_api_invalid_pii_format(self, mock_detector, client):
        """Test API with invalid PII format"""
        mock_detector.validate_pii_format.return_value = False
        
        response = client.get('/api/get-exposed-websites?name=test&pii-type=AADHAR&pii-value=invalid')
        assert response.status_code == 400
        assert b'Invalid PII format' in response.data
    
    @patch('app.detector')
    def test_api_successful_query(self, mock_detector, client):
        """Test successful API query"""
        mock_detector.validate_pii_format.return_value = True
        mock_detector.embed_text.return_value = [0.1] * 300
        
        mock_collection = Mock()
        mock_collection.query.return_value = {
            'metadatas': [[{
                'data': '1234 5678 9012',
                'pii_type': 'AADHAR',
                'website': 'http://example.com',
                'timestamp': '2023-01-01T00:00:00',
                'found_in_image': False
            }]],
            'distances': [[0.5]]
        }
        mock_detector.collection = mock_collection
        
        response = client.get('/api/get-exposed-websites?name=test&pii-type=AADHAR&pii-value=1234%205678%209012')
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'neighbors' in data
        assert len(data['neighbors']) == 1
        assert data['neighbors'][0]['data'] == '1234 5678 9012'

# Run tests with: pytest test_pii_detector.py -v
