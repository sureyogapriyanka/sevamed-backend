const axios = require('axios');

// Test the API endpoints
async function testApi() {
    const baseURL = 'http://localhost:5000';

    try {
        // Test health endpoint
        console.log('Testing health endpoint...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('Health check response:', healthResponse.data);

        // Test root endpoint
        console.log('\nTesting root endpoint...');
        const rootResponse = await axios.get(`${baseURL}/`);
        console.log('Root response:', rootResponse.data);

        console.log('\nAPI tests completed successfully!');
    } catch (error) {
        console.error('API test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testApi();