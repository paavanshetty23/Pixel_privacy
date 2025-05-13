const fs = require('fs');
const path = require('path');

/**
 * Extracts and parses a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Object|null} Parsed JSON object or null if error
 */
function extractJsonFile(filePath) {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`File does not exist: ${filePath}`);
            return null;
        }

        // Read the file content
        const rawData = fs.readFileSync(filePath, 'utf8');
        
        // Parse the JSON data
        const jsonData = JSON.parse(rawData);
        return jsonData;
    } catch (error) {
        console.error(`Error extracting JSON file: ${error.message}`);
        return null;
    }
}

/**
 * Extracts multiple JSON files from a directory
 * @param {string} dirPath - Directory path containing JSON files
 * @param {boolean} recursive - Whether to search recursively
 * @returns {Object} Object with filenames as keys and parsed JSON as values
 */
function extractJsonDirectory(dirPath, recursive = false) {
    const result = {};
    
    try {
        // Check if directory exists
        if (!fs.existsSync(dirPath)) {
            console.error(`Directory does not exist: ${dirPath}`);
            return result;
        }

        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory() && recursive) {
                // If recursive and it's a directory, process it
                const subResults = extractJsonDirectory(fullPath, recursive);
                Object.assign(result, subResults);
            } else if (path.extname(file).toLowerCase() === '.json') {
                // If it's a JSON file, extract it
                const jsonData = extractJsonFile(fullPath);
                if (jsonData !== null) {
                    result[file] = jsonData;
                }
            }
        }
        
        return result;
    } catch (error) {
        console.error(`Error processing directory: ${error.message}`);
        return result;
    }
}

/**
 * Saves a JSON object to a file
 * @param {string} filePath - Path where to save the JSON file
 * @param {Object} data - The data to save
 * @param {number} indent - Number of spaces for indentation
 * @returns {boolean} Success status
 */
function saveJsonToFile(filePath, data, indent = 2) {
    try {
        const dirPath = path.dirname(filePath);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Convert data to JSON string and save to file
        const jsonString = JSON.stringify(data, null, indent);
        fs.writeFileSync(filePath, jsonString, 'utf8');
        
        return true;
    } catch (error) {
        console.error(`Error saving JSON to file: ${error.message}`);
        return false;
    }
}

module.exports = {
    extractJsonFile,
    extractJsonDirectory,
    saveJsonToFile
};
