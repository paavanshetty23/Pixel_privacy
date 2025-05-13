const path = require('path');
const JsonProcessor = require('../utils/JsonProcessor');

// Initialize processor
const processor = new JsonProcessor();

// Sample transform function that adds metadata
function addMetadata(jsonData) {
    return {
        ...jsonData,
        processedAt: new Date().toISOString(),
        metadata: {
            ...(jsonData.metadata || {}),
            processor: 'JsonProcessor',
            version: '2.0.0'
        }
    };
}

// Example usage of advanced features
async function runAdvancedExample() {
    console.log("Advanced JSON Processing Example\n");
    
    // 1. Load with caching
    const sampleFilePath = path.join(__dirname, 'data', 'sample.json');
    console.log(`1. Loading file with caching: ${sampleFilePath}`);
    
    console.time('First load');
    const firstLoad = processor.loadJson(sampleFilePath);
    console.timeEnd('First load');
    
    console.time('Cached load');
    const cachedLoad = processor.loadJson(sampleFilePath);
    console.timeEnd('Cached load');
    
    console.log("Data loaded successfully:", !!cachedLoad);
    
    // 2. Transform JSON
    console.log("\n2. Transforming JSON data");
    const transformed = processor.transformJson(firstLoad, addMetadata);
    console.log("Transformation added fields:", 
        Object.keys(transformed).filter(key => !firstLoad[key] || transformed[key] !== firstLoad[key]));
    
    // 3. Batch processing
    console.log("\n3. Batch processing files");
    const dataDir = path.join(__dirname, 'data');
    const outputDir = path.join(__dirname, 'output', 'processed');
    
    const batchResults = processor.batchProcess(dataDir, addMetadata, outputDir, true);
    
    console.log(`Batch processing results:`);
    console.log(`- Processed: ${batchResults.processed}`);
    console.log(`- Failed: ${batchResults.failed}`);
    console.log(`- Total files: ${batchResults.files.length}`);
    
    // 4. Clear cache
    console.log("\n4. Clearing cache");
    processor.clearCache();
    console.log("Cache cleared");
}

// Run the examples
runAdvancedExample().catch(console.error);
