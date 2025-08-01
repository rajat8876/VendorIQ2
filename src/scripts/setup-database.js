const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  try {
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`✅ Database '${process.env.DB_NAME}' created or already exists`);

    await connection.end();
    console.log('✅ Database setup completed successfully');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure MySQL server is running on your system.');
      console.error('   - Windows: Start MySQL service from Services or XAMPP/WAMP');
      console.error('   - Check if MySQL is installed and configured properly');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Check your database credentials in .env file:');
      console.error('   - DB_USER (currently: ' + process.env.DB_USER + ')');
      console.error('   - DB_PASSWORD');
      console.error('   - DB_HOST (currently: ' + process.env.DB_HOST + ')');
    }
    
    process.exit(1);
  }
}

setupDatabase();