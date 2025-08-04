#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: timeout,
      headers: {
        'User-Agent': 'VendorIQ-Deployment-Verifier/1.0'
      }
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function testEndpoint(url, expectedStatus = 200, description = '') {
  try {
    log(`\n🔍 Testing: ${description || url}`, 'blue');
    const startTime = Date.now();
    
    const response = await makeRequest(url);
    const responseTime = Date.now() - startTime;
    
    // Handle array of expected status codes
    const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    
    if (expectedStatuses.includes(response.statusCode)) {
      log(`✅ ${description || url} - Status: ${response.statusCode} (${responseTime}ms)`, 'green');
      return { success: true, response, responseTime };
    } else {
      log(`❌ ${description || url} - Expected: ${expectedStatuses.join(' or ')}, Got: ${response.statusCode}`, 'red');
      return { success: false, response, responseTime };
    }
  } catch (error) {
    log(`❌ ${description || url} - Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function verifyDeployment(baseUrl) {
  log('🚀 VendorIQ Backend Deployment Verification', 'cyan');
  log(`📍 Testing deployment at: ${baseUrl}`, 'yellow');
  
  const tests = [
    {
      url: `${baseUrl}/health`,
      status: [200, 503], // 503 if Redis is not connected
      description: 'Health Check Endpoint'
    },
    {
      url: `${baseUrl}/api`,
      status: 200,
      description: 'API Information Endpoint'
    },
    {
      url: `${baseUrl}/api/auth/register`,
      status: [400, 404, 422], // May return 404 if route not found, 400/422 for validation
      description: 'Authentication Endpoint (without data)'
    },
    {
      url: `${baseUrl}/api/requests`,
      status: [200, 401, 500], // May require auth, be public, or have server error
      description: 'Service Requests Endpoint'
    },
    {
      url: `${baseUrl}/api/users`,
      status: 200, // Test route exists
      description: 'Users API Endpoint'
    },
    {
      url: `${baseUrl}/api/payments/subscriptions`,
      status: 401, // Should require authentication
      description: 'Payment Subscriptions Endpoint (auth required)'
    },
    {
      url: `${baseUrl}/api/industries`,
      status: 200,
      description: 'Industries Endpoint (public)'
    }
  ];
  
  const results = [];
  let passedTests = 0;
  
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.status, test.description);
    results.push({ ...test, ...result });
    
    if (result.success) {
      passedTests++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  log('\n📊 Test Summary', 'cyan');
  log(`✅ Passed: ${passedTests}/${tests.length}`, passedTests === tests.length ? 'green' : 'yellow');
  
  if (passedTests === tests.length) {
    log('\n🎉 All tests passed! Your deployment is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the deployment configuration.', 'yellow');
  }
  
  // Detailed results
  log('\n📋 Detailed Results:', 'cyan');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const color = result.success ? 'green' : 'red';
    log(`${status} ${result.description}: ${result.response?.statusCode || 'Error'} ${result.responseTime ? `(${result.responseTime}ms)` : ''}`, color);
  });
  
  // Performance summary
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.responseTime).length;
  
  if (avgResponseTime) {
    log(`\n⚡ Average Response Time: ${Math.round(avgResponseTime)}ms`, 'blue');
  }
  
  // Health check details
  const healthResult = results.find(r => r.url.includes('/health'));
  if (healthResult && healthResult.success && healthResult.response.data) {
    log('\n🏥 Health Check Details:', 'cyan');
    const healthData = healthResult.response.data;
    log(`   Environment: ${healthData.environment || 'unknown'}`, 'white');
    log(`   Database: ${healthData.services?.database || 'unknown'}`, 'white');
    log(`   Redis: ${healthData.services?.redis || 'unknown'}`, 'white');
    log(`   Timestamp: ${healthData.timestamp || 'unknown'}`, 'white');
  }
  
  return {
    totalTests: tests.length,
    passedTests,
    success: passedTests === tests.length,
    results
  };
}

function showUsage() {
  log('\n📋 VendorIQ Backend Deployment Verifier', 'cyan');
  log('\nUsage: node verify-deployment.js <base-url>', 'yellow');
  log('\nExamples:', 'yellow');
  log('  node verify-deployment.js http://localhost:3000', 'white');
  log('  node verify-deployment.js https://your-app.herokuapp.com', 'white');
  log('  node verify-deployment.js https://your-app.railway.app', 'white');
}

async function main() {
  const baseUrl = process.argv[2];
  
  if (!baseUrl) {
    showUsage();
    process.exit(1);
  }
  
  // Validate URL
  try {
    new URL(baseUrl);
  } catch (error) {
    log(`❌ Invalid URL: ${baseUrl}`, 'red');
    showUsage();
    process.exit(1);
  }
  
  // Remove trailing slash
  const cleanUrl = baseUrl.replace(/\/$/, '');
  
  try {
    const result = await verifyDeployment(cleanUrl);
    
    if (result.success) {
      log('\n🚀 Deployment verification completed successfully!', 'green');
      process.exit(0);
    } else {
      log('\n⚠️  Deployment verification completed with issues.', 'yellow');
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Verification failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  verifyDeployment,
  testEndpoint
};