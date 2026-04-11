const mongoose = require("mongoose");
const VBook = require("./models/VBookModel");
const Vehicle = require("./models/VehiModel");

// Connect to MongoDB (same connection as app.js)
mongoose.connect("mongodb+srv://admin:xS3LBsRT0zoGDGx7@tourismplatform.insljjg.mongodb.net/");

const migrateToObjectIdReferences = async () => {
  try {
    console.log("🔄 Starting migration to ObjectId references...");
    
    // Get all bookings
    const bookings = await VBook.find({});
    
    console.log(`📊 Found ${bookings.length} bookings to check`);
    
    let updated = 0;
    let alreadyCorrect = 0;
    let failed = 0;
    
    for (const booking of bookings) {
      try {
        // Check if VehicleId is already an ObjectId
        if (booking.VehicleId instanceof mongoose.Types.ObjectId) {
          console.log(`✓ Booking ${booking._id} already has ObjectId reference`);
          alreadyCorrect++;
          continue;
        }
        
        // If VehicleId is a string, try to convert it
        if (typeof booking.VehicleId === 'string') {
          // Verify the vehicle exists
          const vehicle = await Vehicle.findById(booking.VehicleId);
          
          if (vehicle) {
            // Update to ObjectId
            booking.VehicleId = mongoose.Types.ObjectId(booking.VehicleId);
            await booking.save();
            console.log(`✅ Updated booking ${booking._id} to use ObjectId reference`);
            updated++;
          } else {
            console.log(`⚠️  Vehicle not found for booking ${booking._id} (VehicleId: ${booking.VehicleId})`);
            failed++;
          }
        }
      } catch (err) {
        console.error(`❌ Error updating booking ${booking._id}:`, err.message);
        failed++;
      }
    }
    
    console.log("\n📈 Migration Summary:");
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ✓ Already correct: ${alreadyCorrect}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total: ${bookings.length}`);
    
    mongoose.connection.close();
    console.log("\n✅ Migration completed!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    mongoose.connection.close();
  }
};

migrateToObjectIdReferences();
