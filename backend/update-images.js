const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
const mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://damidu2002:1234@cluster0.8qubv.mongodb.net/tourism_db?retryWrites=true&w=majority';

// Import models
const Destination = require('./models/destinationModel');
const AdventureActivity = require('./models/activityModel');

const updateImagesInDatabase = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to database');

    // Update destinations with specific images
    const destinationUpdates = [
      {
        name: 'Ella Nine Arch Bridge',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        name: 'Galle Fort',
        images: [
          'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1594736797933-d0c1ac9d38dc?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        name: 'Temple of the Tooth',
        images: [
          'https://images.unsplash.com/photo-1599582909646-bbfedc76f768?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        name: 'Sigiriya Rock Fortress',
        images: [
          'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1620637321003-0ad5a2a32d3b?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        name: 'Nuwara Eliya Tea Plantations',
        images: [
          'https://images.unsplash.com/photo-1587804825453-baafba04b4a0?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=600&h=400&fit=crop&auto=format'
        ]
      }
    ];

    for (const update of destinationUpdates) {
      const result = await Destination.updateOne(
        { name: { $regex: new RegExp(update.name, 'i') } },
        { $set: { images: update.images } }
      );
      console.log(`Updated ${update.name}:`, result.modifiedCount > 0 ? 'Success' : 'Not found');
    }

    // Update adventures with specific images
    const adventureUpdates = [
      {
        title: 'Ella Rock Trekking',
        images: [
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        title: 'Mirissa Whale Watching',
        images: [
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        title: 'Yala National Park Safari',
        images: [
          'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        title: 'Unawatuna Scuba Diving',
        images: [
          'https://images.unsplash.com/photo-1554629947-334ff61d85dc?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        title: 'Adam\'s Peak Sunrise Hike',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format'
        ]
      },
      {
        title: 'Kandy Cultural Tour',
        images: [
          'https://images.unsplash.com/photo-1599582909646-bbfedc76f768?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&auto=format'
        ]
      }
    ];

    for (const update of adventureUpdates) {
      const result = await AdventureActivity.updateOne(
        { title: { $regex: new RegExp(update.title, 'i') } },
        { $set: { images: update.images } }
      );
      console.log(`Updated ${update.title}:`, result.modifiedCount > 0 ? 'Success' : 'Not found');
    }

    console.log('\n✅ All image updates completed!');
    
  } catch (error) {
    console.error('Error updating images:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

// Run the update
updateImagesInDatabase();