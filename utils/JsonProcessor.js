const fs = require('fs');
const path = require('path');
const { extractJsonFile, extractJsonDirectory, saveJsonToFile } = require('./jsonExtractor');

/**
 * Advanced JSON processing class that builds on the basic JSON extraction utilities
 */
class JsonProcessor {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Loads a JSON file with caching capabilities
     * @param {string} filePath - Path to the JSON file
     * @param {boolean} useCache - Whether to use cached data if available
     * @returns {Object|null} Parsed JSON object or null if error
     */
    loadJson(filePath, useCache = true) {
        // Use cached data if requested and available
        if (useCache && this.cache.has(filePath)) {
            return this.cache.get(filePath);
        }

        // Extract the file
        const data = extractJsonFile(filePath);
        
        // Cache the result if successful
        if (data !== null && useCache) {
            this.cache.set(filePath, data);
        }
        
        return data;
    }

    /**
     * Applies a transform function to JSON data
     * @param {Object} jsonData - The JSON data to transform
     * @param {Function} transformFn - The transform function to apply
     * @returns {Object} The transformed data
     */
    transformJson(jsonData, transformFn) {
        if (!jsonData || typeof transformFn !== 'function') {
            return jsonData;
        }
        
        try {
            return transformFn(jsonData);
        } catch (error) {
            console.error(`Error transforming JSON: ${error.message}`);
            return jsonData;
        }
    }

    /**
     * Processes multiple JSON files with the same transform function
     * @param {string} dirPath - Directory containing JSON files
     * @param {Function} transformFn - Transform function to apply
     * @param {string} outputDir - Directory to save processed files
     * @param {boolean} recursive - Whether to process subdirectories
     * @returns {Object} Results of the batch processing
     */
    batchProcess(dirPath, transformFn, outputDir, recursive = false) {
        const results = {
            processed: 0,
            failed: 0,
            files: []
        };
        
        // Load all files from the directory
        const jsonFiles = extractJsonDirectory(dirPath, recursive);
        
        // Process each file
        for (const [filename, data] of Object.entries(jsonFiles)) {
            try {
                // Apply the transform
                const transformed = this.transformJson(data, transformFn);
                
                // Create output path
                const relativePath = path.relative(dirPath, path.join(dirPath, filename));
                const outputPath = path.join(outputDir, relativePath);
                
                // Save the transformed data
                const success = saveJsonToFile(outputPath, transformed);
                
                // Track results
                results.files.push({
                    input: path.join(dirPath, filename),
                    output: outputPath,
                    success
                });
                
                if (success) {
                    results.processed++;
                } else {
                    results.failed++;
                }
            } catch (error) {
                results.failed++;
                results.files.push({
                    input: path.join(dirPath, filename),
                    error: error.message,
                    success: false
                });
            }
        }
        
        return results;
    }

    /**
     * Clears the processor's cache
     */
    clearCache() {
        this.cache.clear();
    }
}

module.exports = JsonProcessor;
