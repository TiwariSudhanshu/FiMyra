// Quick diagnostic script to check what's in your database
// Run with: node scripts/check-data.js

const fs = require('fs');
const path = require('path');

// Simple .env.local parser
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const mongoose = require('mongoose');

async function checkData() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.error('Make sure .env.local file exists with MONGODB_URI');
      return;
    }
    
    console.log('Using database: fimyra');
    await mongoose.connect(mongoURI, { dbName: 'fimyra' });
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Try to find any user
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('❌ No users found in database');
      console.log('\n⚠️ This is the problem! The database is empty or using wrong connection.');
      console.log('Check your MONGODB_URI in .env.local');
      return;
    }
    
    // Get your user (try multiple ways)
    let user = await User.findOne({}).sort({ _id: -1 }); // Get most recent user
    
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('👤 User:', user.email || user._id);
    console.log('\n📊 MEALS DATA:');
    console.log('Total meal entries:', user.meals?.length || 0);
    
    if (user.meals && user.meals.length > 0) {
      console.log('\nMeal dates (last 10):');
      const sortedMeals = user.meals.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 10);
      
      sortedMeals.forEach((meal, i) => {
        const totalItems = 
          (meal.breakfast?.length || 0) + 
          (meal.lunch?.length || 0) + 
          (meal.dinner?.length || 0) + 
          (meal.snacks?.length || 0);
        
        console.log(`${i + 1}. ${new Date(meal.date).toLocaleDateString()} - ${totalItems} items`);
        
        // Show some detail
        if (meal.breakfast?.length) console.log(`   Breakfast: ${meal.breakfast.map(m => m.name).join(', ')}`);
        if (meal.lunch?.length) console.log(`   Lunch: ${meal.lunch.map(m => m.name).join(', ')}`);
        if (meal.dinner?.length) console.log(`   Dinner: ${meal.dinner.map(m => m.name).join(', ')}`);
        if (meal.snacks?.length) console.log(`   Snacks: ${meal.snacks.map(m => m.name).join(', ')}`);
      });
      
      console.log('\nLatest meal date:', new Date(sortedMeals[0].date).toISOString());
      console.log('Oldest meal date:', new Date(sortedMeals[sortedMeals.length - 1].date).toISOString());
    } else {
      console.log('⚠️ No meals in database!');
    }
    
    console.log('\n📊 DAILY TRACKING DATA:');
    console.log('Total tracking entries:', user.dailyTracking?.length || 0);
    
    if (user.dailyTracking && user.dailyTracking.length > 0) {
      console.log('\nTracking dates (last 10):');
      const sortedTracking = user.dailyTracking.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 10);
      
      sortedTracking.forEach((track, i) => {
        console.log(`${i + 1}. ${new Date(track.date).toLocaleDateString()} - ` +
          `Cal: ${track.caloriesConsumed || 0}/${track.caloriesGoal || 0}, ` +
          `Protein: ${track.proteinConsumed || 0}/${track.proteinGoal || 0}`);
      });
      
      console.log('\nLatest tracking date:', new Date(sortedTracking[0].date).toISOString());
    } else {
      console.log('⚠️ No tracking data in database!');
    }
    
    console.log('\n🔍 TIMEZONE CHECK:');
    const now = new Date();
    console.log('Server time (now):', now.toISOString());
    console.log('Server local time:', now.toLocaleString());
    
    if (user.meals && user.meals.length > 0) {
      const latestMeal = user.meals.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      const daysDiff = Math.floor((now - new Date(latestMeal.date)) / (1000 * 60 * 60 * 24));
      console.log(`Latest meal is ${daysDiff} days old`);
      
      if (daysDiff > 1) {
        console.log('⚠️ WARNING: Latest meal is more than 1 day old!');
        console.log('This might explain why analytics shows old data.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkData();
