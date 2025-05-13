const path = require('path');
const { extractJsonFile, extractJsonDirectory, saveJsonToFile } = require('../utils/jsonExtractor');

// Example usage
function runExamples() {
    console.log("JSON Extractor Examples\n");
    
    // 1. Extract single JSON file
    const sampleFilePath = path.join(__dirname, 'data', 'sample.json');
    console.log(`1. Extracting single file: ${sampleFilePath}`);
    const singleFileData = extractJsonFile(sampleFilePath);
    if (singleFileData) {
        console.log("Single file extraction successful:");
        console.log(singleFileData);
    }
    
    // 2. Extract all JSON files from a directory
    const dataDir = path.join(__dirname, 'data');
    console.log(`\n2. Extracting all JSON files from directory: ${dataDir}`);
    const directoryData = extractJsonDirectory(dataDir, false);
    console.log("Directory extraction results:");
    console.log(Object.keys(directoryData));
    
    // 3. Extract JSON files recursively
    console.log(`\n3. Extracting JSON files recursively from: ${dataDir}`);
    const recursiveData = extractJsonDirectory(dataDir, true);
    console.log("Recursive extraction found files:");
    console.log(Object.keys(recursiveData));
    
    // 4. Modify and save JSON data
    console.log("\n4. Modifying and saving JSON data");
    if (singleFileData) {
        // Make some modifications
        singleFileData.modifiedAt = new Date().toISOString();
        singleFileData.modifiedBy = "JsonExtractorExample";
        
        // Save to a new file
        const outputPath = path.join(__dirname, 'output', 'modified_sample.json');
        console.log(`Saving modified data to: ${outputPath}`);
        
        const saveResult = saveJsonToFile(outputPath, singleFileData);
        if (saveResult) {
            console.log("Data saved successfully");
        }
    }
}

// Run the examples
runExamples();
