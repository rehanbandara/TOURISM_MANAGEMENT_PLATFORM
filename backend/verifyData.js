const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Destination = require('./models/destinationModel');
const AdventureActivity = require('./models/activityModel');

// MongoDB connection
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/tourism_db';

mongoose.connect(mongoUrl, {})
.then(() => {
    console.log("Database Connected for verification!");
})
.catch((error) => {
    console.log("❌ Database connection failed:", error.message);
    process.exit(1);
});

async function verifyData() {
    try {
        console.log('🔍 Verifying database data...\n');
        
        // Check destinations
        const destinations = await Destination.find({});
        console.log(`📍 DESTINATIONS (${destinations.length} found):`);
        destinations.forEach((dest, index) => {
            console.log(`${index + 1}. ${dest.name}`);
            console.log(`   📍 Location: ${dest.location}`);
            console.log(`   💰 Entry Fee: ₹${dest.entryFee}`);
            console.log(`   ⭐ Rating: ${dest.rating}/5`);
            console.log(`   🎯 Activities: ${dest.activities.join(', ')}`);
            console.log('');
        });
        
        // Check activities
        const activities = await AdventureActivity.find({});
        console.log(`🎯 ADVENTURE ACTIVITIES (${activities.length} found):`);
        activities.forEach((activity, index) => {
            console.log(`${index + 1}. ${activity.title}`);
            console.log(`   📍 Location: ${activity.location}`);
            console.log(`   💰 Price: ₹${activity.price}`);
            console.log(`   ⏱️  Duration: ${activity.durationHours} hours`);
            console.log(`   📈 Difficulty: ${activity.difficulty}`);
            console.log(`   ⭐ Rating: ${activity.rating}/5`);
            console.log('');
        });
        
        console.log('✅ Data verification completed successfully!');
        console.log('\n🎉 Your database is now populated with sample data!');
        console.log('\n📋 Next steps:');
        console.log('   1. Make sure your backend server is running (node server.js)');
        console.log('   2. Test the endpoints:');
        console.log('      - GET http://127.0.0.1:5000/api/destinations');
        console.log('      - GET http://127.0.0.1:5000/api/activities');
        console.log('   3. Update your frontend to fetch this data');
        
    } catch (error) {
        console.error('❌ Error verifying data:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the verification
verifyData();