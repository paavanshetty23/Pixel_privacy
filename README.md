# Pixel_privacy

# JSON Extraction and Processing Utility

A comprehensive utility for extracting, processing, and manipulating JSON files.

## Features

- Extract JSON from individual files
- Process multiple JSON files from directories
- Recursive directory scanning
- JSON transformation capabilities
- Batch processing with custom transforms
- Caching for improved performance
- Save modified JSON to files

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd Mini_project

# Install dependencies
npm install
```

## Basic Usage

### Extract a single JSON file

```javascript
const { extractJsonFile } = require('./utils/jsonExtractor');

const data = extractJsonFile('path/to/file.json');
console.log(data);
```

### Extract all JSON files from a directory

```javascript
const { extractJsonDirectory } = require('./utils/jsonExtractor');

// Non-recursive (just the specified directory)
const data = extractJsonDirectory('path/to/directory');

// Recursive (includes subdirectories)
const recursiveData = extractJsonDirectory('path/to/directory', true);
```

### Save JSON to a file

```javascript
const { saveJsonToFile } = require('./utils/jsonExtractor');

const data = { name: "Test", value: 42 };
saveJsonToFile('path/to/output.json', data);
```

## Advanced Usage

For advanced JSON processing, use the `JsonProcessor` class:

```javascript
const JsonProcessor = require('./utils/JsonProcessor');

const processor = new JsonProcessor();

// Load a JSON file with caching
const data = processor.loadJson('path/to/file.json');

// Transform JSON data
const transformed = processor.transformJson(data, jsonObj => {
  return {
    ...jsonObj,
    timestamp: new Date().toISOString()
  };
});

// Batch process multiple files
const results = processor.batchProcess(
  'input/directory',
  transformFunction,
  'output/directory',
  true // recursive
);
```

## Examples

Run the provided examples to see the utility in action:

```bash
# Basic examples
node examples/jsonExtractorExample.js

# Advanced examples
node examples/advancedJsonProcessing.js
```

## File Structure

- `utils/jsonExtractor.js` - Core extraction utilities
- `utils/JsonProcessor.js` - Advanced JSON processing class
- `examples/` - Example implementations and sample data
  - `jsonExtractorExample.js` - Basic usage examples
  - `advancedJsonProcessing.js` - Advanced features demonstration
  - `data/` - Sample JSON files for testing
  - `output/` - Output directory for processed files

## License

MIT
