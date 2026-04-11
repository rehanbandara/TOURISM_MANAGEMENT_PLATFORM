// Test if .env file is loading correctly
require('dotenv').config();

console.log("\n🔍 Environment Variables Test\n");
console.log("================================");

// Check Stripe Keys
console.log("\n💳 STRIPE CONFIGURATION:");
console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "✅ Loaded" : "❌ Missing");
if (process.env.STRIPE_SECRET_KEY) {
  const key = process.env.STRIPE_SECRET_KEY;
  console.log("  - Starts with:", key.substring(0, 7));
  console.log("  - Length:", key.length, "characters");
  console.log("  - Type:", key.startsWith('sk_test_') ? "Test Key ✅" : key.startsWith('sk_live_') ? "Live Key ⚠️" : "Invalid Key ❌");
}

// Check Email Config
console.log("\n📧 EMAIL CONFIGURATION:");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅ Loaded" : "❌ Missing");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing");

// Check URLs
console.log("\n🌐 URL CONFIGURATION:");
console.log("CLIENT_URL:", process.env.CLIENT_URL || "http://localhost:3000 (default)");

console.log("\n================================");

// Overall Status
const allGood = process.env.STRIPE_SECRET_KEY && process.env.EMAIL_USER && process.env.EMAIL_PASS;
if (allGood) {
  console.log("✅ All environment variables are loaded!");
  console.log("✅ Your payment system should work!");
} else {
  console.log("❌ Some environment variables are missing!");
  console.log("⚠️  Please check your .env file in the Backend folder");
  console.log("\nMissing variables:");
  if (!process.env.STRIPE_SECRET_KEY) console.log("  - STRIPE_SECRET_KEY");
  if (!process.env.EMAIL_USER) console.log("  - EMAIL_USER");
  if (!process.env.EMAIL_PASS) console.log("  - EMAIL_PASS");
}

console.log("\n");

