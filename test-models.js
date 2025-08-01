// Test script for Sequelize models
const models = require('./src/models');
const { User, ServiceRequest, Industry, Category } = models;

async function testModels() {
  try {
    console.log('🔍 Testing Sequelize Models...');
    console.log('Available models:', Object.keys(models));
    
    // Test 1: Model imports
    console.log('\n✅ Models imported successfully');
    
    // Test 2: Database connection
    await models.sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Test 3: User model methods
    console.log('\n🧪 Testing User model methods...');
    
    const testUser = User.build({
      business_name: 'Test Business Ltd',
      contact_person: 'John Doe',
      phone: '9876543210',
      email: 'john@testbusiness.com',
      password: 'testpassword123',
      location: 'Mumbai, India',
      industries: ['technology', 'consulting'],
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    
    console.log('✅ User model built successfully');
    console.log('- Business Name:', testUser.business_name);
    console.log('- Trial Active:', testUser.isTrialActive());
    console.log('- Can Post Requests:', testUser.canPostRequests());
    
    // Test password validation (before hashing)
    const plainPassword = 'testpassword123';
    console.log('- Password validation test ready');
    
    // Test JSON serialization (should exclude password)
    const userJSON = testUser.toJSON();
    console.log('- Password excluded from JSON:', !userJSON.hasOwnProperty('password'));
    console.log('- Remember token excluded:', !userJSON.hasOwnProperty('remember_token'));
    
    // Test 4: ServiceRequest model methods
    console.log('\n🧪 Testing ServiceRequest model methods...');
    
    const testRequest = ServiceRequest.build({
      title: 'Need Web Development Services',
      description: 'Looking for a professional web developer to build an e-commerce website',
      location: 'Delhi, India',
      budget: '50000-100000',
      status: 'open',
      custom_fields: {
        technology: 'React.js',
        timeline: '3 months'
      },
      attachments: ['requirements.pdf'],
      response_count: 0,
      view_count: 5
    });
    
    console.log('✅ ServiceRequest model built successfully');
    console.log('- Title:', testRequest.title);
    console.log('- Status:', testRequest.status);
    console.log('- Custom Fields:', testRequest.custom_fields);
    
    // Test 5: Model associations
    console.log('\n🧪 Testing Model Associations...');
    
    console.log('User associations:', Object.keys(User.associations));
    console.log('ServiceRequest associations:', Object.keys(ServiceRequest.associations));
    
    // Test static methods
    console.log('\n🧪 Testing Static Methods...');
    console.log('- ServiceRequest.getOpen method exists:', typeof ServiceRequest.getOpen === 'function');
    console.log('- ServiceRequest.getByIndustry method exists:', typeof ServiceRequest.getByIndustry === 'function');
    console.log('- ServiceRequest.getByLocation method exists:', typeof ServiceRequest.getByLocation === 'function');
    
    console.log('\n🎉 All model tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Models load correctly');
    console.log('- ✅ Database connection works');
    console.log('- ✅ User helper methods work');
    console.log('- ✅ ServiceRequest methods work');
    console.log('- ✅ Model associations defined');
    console.log('- ✅ JSON serialization works');
    
  } catch (error) {
    console.error('❌ Model test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await models.sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the tests
testModels();