const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function testAPIs() {
    try {
        console.log('🧪 Testing API endpoints...\n');
        
        // Test destinations endpoint
        console.log('📍 Testing Destinations API:');
        const destinationsResponse = await axios.get(`${BASE_URL}/destinations`);
        console.log(`✅ GET /destinations - Status: ${destinationsResponse.status}`);
        console.log(`   Found ${destinationsResponse.data.destinations?.length || destinationsResponse.data.length} destinations`);
        
        if (destinationsResponse.data.destinations?.length > 0 || destinationsResponse.data.length > 0) {
            const destinations = destinationsResponse.data.destinations || destinationsResponse.data;
            console.log(`   Sample: ${destinations[0].name} - ${destinations[0].location}`);
        }
        
        // Test activities endpoint
        console.log('\n🎯 Testing Activities API:');
        const activitiesResponse = await axios.get(`${BASE_URL}/activities`);
        console.log(`✅ GET /activities - Status: ${activitiesResponse.status}`);
        console.log(`   Found ${activitiesResponse.data.activities?.length || activitiesResponse.data.length} activities`);
        
        if (activitiesResponse.data.activities?.length > 0 || activitiesResponse.data.length > 0) {
            const activities = activitiesResponse.data.activities || activitiesResponse.data;
            console.log(`   Sample: ${activities[0].title} - ${activities[0].category} (₹${activities[0].price})`);
        }
        
        // Test health endpoint
        console.log('\n🏥 Testing Health Check:');
        const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
        console.log(`✅ GET /health - Status: ${healthResponse.status}`);
        console.log(`   Message: ${healthResponse.data.message}`);
        
        console.log('\n🎉 All API tests passed successfully!');
        console.log('\n📋 API Endpoints Available:');
        console.log('   GET  /api/destinations     - Get all destinations');
        console.log('   GET  /api/destinations/:id - Get destination by ID');
        console.log('   GET  /api/activities       - Get all activities');
        console.log('   GET  /api/activities/:id   - Get activity by ID');
        console.log('   POST /api/users/register   - Register new user');
        console.log('   POST /api/users/login      - Login user');
        
    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, error.response.data);
        }
    }
}

// Run the API tests
testAPIs();