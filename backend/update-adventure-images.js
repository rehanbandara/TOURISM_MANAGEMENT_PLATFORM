const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
const mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://damidu2002:1234@cluster0.8qubv.mongodb.net/tourism_db?retryWrites=true&w=majority';

// Import models
const AdventureActivity = require('./models/activityModel');

const updateAdventureImages = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to database');

    // Update adventures with specific images based on actual database titles
    const adventureUpdates = [
      {
        title: 'White Water Rafting in Kitulgala',
        images: [
          'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        title: 'Adam\'s Peak Hiking',
        images: [
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        title: 'Surfing Lessons at Arugam Bay',
        images: [
          'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1455264745730-cb6b83401cad?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        title: 'Rock Climbing at Ella Rock',
        images: [
          'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        title: 'Diving at Pigeon Island',
        images: [
          'https://images.unsplash.com/photo-1554629947-334ff61d85dc?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        title: 'Zip Lining in Kandy',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop&auto=format'
        ]
      }
    ];

    for (const update of adventureUpdates) {
      const result = await AdventureActivity.updateOne(
        { title: update.title },
        { $set: { images: update.images } }
      );
      console.log(`Updated ${update.title}:`, result.modifiedCount > 0 ? 'Success' : 'Not found');
    }

    console.log('\n✅ All adventure image updates completed!');
    
  } catch (error) {
    console.error('Error updating adventure images:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

// Run the update
updateAdventureImages();