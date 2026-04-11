const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Destination = require('./models/destinationModel');
const AdventureActivity = require('./models/activityModel');

// MongoDB connection
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/tourism_db';

mongoose.connect(mongoUrl, {})
.then(() => {
    console.log("Database Connected for seeding!");
})
.catch((error) => {
    console.log("❌ Database connection failed:", error.message);
    process.exit(1);
});

// Sample destinations data
const destinations = [
    {
        name: "Sigiriya Rock Fortress",
        location: "Dambulla, Central Province",
        description: "An ancient rock fortress and palace ruins surrounded by the remains of an extensive network of gardens, reservoirs, and other structures. It's a UNESCO World Heritage Site and one of the best-preserved examples of ancient urban planning.",
        images: [
            "https://images.unsplash.com/photo-1566552881560-0be862a7c445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        entryFee: 4200,
        bestTimeToVisit: "December to March",
        activities: ["Rock Climbing", "Historical Exploration", "Photography", "Nature Walks"],
        rating: 4.8
    },
    {
        name: "Ella Nine Arch Bridge",
        location: "Ella, Uva Province",
        description: "One of the most iconic railway bridges in Sri Lanka, built during the British colonial period. The bridge is set in beautiful green hills and offers spectacular views of the surrounding tea plantations.",
        images: [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1566552881560-0be862a7c445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        entryFee: 0,
        bestTimeToVisit: "April to September",
        activities: ["Train Spotting", "Photography", "Hiking", "Tea Plantation Tours"],
        rating: 4.6
    },
    {
        name: "Galle Fort",
        location: "Galle, Southern Province",
        description: "A historic fortified city built first by the Portuguese, then extensively modified by the Dutch. It's a UNESCO World Heritage Site and a great example of European architecture in South Asia.",
        images: [
            "https://images.unsplash.com/photo-1562693107-4e8b2e1c6bf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        entryFee: 500,
        bestTimeToVisit: "December to March",
        activities: ["Historical Walking Tours", "Shopping", "Photography", "Lighthouse Visit"],
        rating: 4.5
    },
    {
        name: "Temple of the Tooth",
        location: "Kandy, Central Province",
        description: "A Buddhist temple that houses the sacred tooth relic of Buddha. It's one of the most important Buddhist pilgrimage sites in the world and a UNESCO World Heritage Site.",
        images: [
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        entryFee: 1500,
        bestTimeToVisit: "Year-round",
        activities: ["Religious Ceremonies", "Cultural Tours", "Photography", "Meditation"],
        rating: 4.7
    },
    {
        name: "Yala National Park",
        location: "Yala, Southern Province",
        description: "Sri Lanka's most famous national park, known for having one of the highest leopard concentrations in the world. The park is also home to elephants, bears, and numerous bird species.",
        images: [
            "https://images.unsplash.com/photo-1566552881560-0be862a7c445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1562693107-4e8b2e1c6bf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        entryFee: 3500,
        bestTimeToVisit: "February to July",
        activities: ["Safari Tours", "Wildlife Photography", "Bird Watching", "Nature Walks"],
        rating: 4.4
    }
];

// Sample adventure activities data
const activities = [
    {
        title: "White Water Rafting in Kitulgala",
        category: "Water Sports",
        location: "Kitulgala, Sabaragamuwa Province",
        description: "Experience the thrill of white water rafting on the Kelani River. Navigate through exciting rapids surrounded by lush tropical rainforest. Perfect for adventure seekers looking for an adrenaline rush.",
        price: 2500,
        durationHours: 3,
        difficulty: "Medium",
        images: [
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1566552881560-0be862a7c445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        rating: 4.6
    },
    {
        title: "Adam's Peak Hiking",
        category: "Mountain Hiking",
        location: "Adam's Peak, Ratnapura District",
        description: "Hike to the summit of Sri Lanka's most sacred mountain. The challenging night hike rewards you with breathtaking sunrise views and spiritual significance for multiple religions.",
        price: 1500,
        durationHours: 8,
        difficulty: "Hard",
        images: [
            "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        rating: 4.8
    },
    {
        title: "Surfing Lessons at Arugam Bay",
        category: "Water Sports",
        location: "Arugam Bay, Eastern Province",
        description: "Learn to surf at one of the world's top surfing destinations. Perfect waves for beginners and pros alike, with professional instructors and equipment provided.",
        price: 3000,
        durationHours: 4,
        difficulty: "Easy",
        images: [
            "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1566552881560-0be862a7c445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        rating: 4.5
    },
    {
        title: "Rock Climbing at Ella Rock",
        category: "Extreme Sports",
        location: "Ella, Uva Province",
        description: "Challenge yourself with rock climbing on the famous Ella Rock. Suitable for intermediate climbers, with stunning views of the hill country as your reward.",
        price: 4000,
        durationHours: 6,
        difficulty: "Medium",
        images: [
            "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        rating: 4.3
    },
    {
        title: "Diving at Pigeon Island",
        category: "Water Sports",
        location: "Trincomalee, Eastern Province",
        description: "Explore the underwater world at Pigeon Island National Park. Discover colorful coral reefs, tropical fish, and maybe even spot some reef sharks.",
        price: 5500,
        durationHours: 5,
        difficulty: "Easy",
        images: [
            "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1562693107-4e8b2e1c6bf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        rating: 4.7
    },
    {
        title: "Zip Lining in Kandy",
        category: "Extreme Sports",
        location: "Kandy, Central Province",
        description: "Soar through the treetops with an exhilarating zip line experience. Perfect for families and thrill-seekers alike, with multiple lines of varying difficulty.",
        price: 3500,
        durationHours: 2,
        difficulty: "Easy",
        images: [
            "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        rating: 4.4
    }
];

async function seedDatabase() {
    try {
        // Clear existing data
        await Destination.deleteMany({});
        await AdventureActivity.deleteMany({});
        
        console.log('🗑️  Cleared existing data');
        
        // Insert destinations
        const insertedDestinations = await Destination.insertMany(destinations);
        console.log(`✅ Inserted ${insertedDestinations.length} destinations`);
        
        // Insert activities
        const insertedActivities = await AdventureActivity.insertMany(activities);
        console.log(`✅ Inserted ${insertedActivities.length} adventure activities`);
        
        console.log('🎉 Database seeding completed successfully!');
        
        // Display summary
        console.log('\n📊 SUMMARY:');
        console.log(`Destinations: ${insertedDestinations.length}`);
        console.log(`Activities: ${insertedActivities.length}`);
        
        console.log('\n📍 DESTINATIONS ADDED:');
        insertedDestinations.forEach((dest, index) => {
            console.log(`${index + 1}. ${dest.name} - ${dest.location} (₹${dest.entryFee})`);
        });
        
        console.log('\n🎯 ACTIVITIES ADDED:');
        insertedActivities.forEach((activity, index) => {
            console.log(`${index + 1}. ${activity.title} - ${activity.category} (₹${activity.price})`);
        });
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the seeding
seedDatabase();