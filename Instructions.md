# VendorIQ Backend Development Guide

This document provides comprehensive information for backend developers to implement the Laravel API for VendorIQ platform.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Database Schema](#database-schema)
4. [Laravel Models](#laravel-models)
5. [API Routes & Endpoints](#api-routes--endpoints)
6. [Authentication System](#authentication-system)
7. [File Upload System](#file-upload-system)
8. [Dynamic Form System](#dynamic-form-system)
9. [Payment Integration](#payment-integration)
10. [Admin Features](#admin-features)
11. [Notifications](#notifications)
12. [Implementation Priority](#implementation-priority)

## Project Overview

VendorIQ is a B2B platform that replaces chaotic WhatsApp trade groups across industries. It allows businesses to:
- Post service requests with industry-specific forms
- Respond to opportunities from other businesses
- Manage B2B transactions efficiently
- Get verified and build reputation through ratings

### Key Features
- **Free 30-day trial** for every business
- **Paid plans** starting at ₹200-₹300/month
- **Industry-specific modules** (Travel, Events, Logistics, etc.)
- **Verification system** for businesses
- **Rating & review system**
- **Real-time notifications**

## Frontend Architecture

### Technology Stack
- **Framework**: Vue.js 3 with Composition API
- **Routing**: Vue Router
- **State Management**: Pinia stores
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue
- **Build Tool**: Vite

### Component Structure
```
src/
├── components/
│   ├── Layout.vue          # Main layout with navigation
│   └── Empty.vue           # Empty state component
├── pages/
│   ├── LandingPage.vue     # Public landing page
│   ├── ListingWall.vue     # Main dashboard showing all requests
│   ├── PostRequest.vue     # Multi-step form for creating requests
│   ├── RequestDetails.vue  # Individual request view with responses
│   ├── MyRequests.vue      # User's own requests management
│   ├── Profile.vue         # User profile and business info
│   ├── AdminDashboard.vue  # Admin panel
│   ├── PricingPage.vue     # Subscription plans
│   └── Register.vue        # User registration
├── stores/
│   ├── auth.ts            # Authentication state management
│   └── requests.ts        # Requests and responses state
└── router/
    └── index.ts           # Route definitions
```

### State Management (Pinia Stores)

#### Auth Store (`stores/auth.ts`)
```typescript
interface User {
  id: string
  businessName: string
  contactPerson: string
  phone: string
  email: string
  location: string
  industries: string[]
  isVerified: boolean
  rating: number
  totalReviews: number
  joinedDate: string
  subscriptionStatus: 'trial' | 'active' | 'expired'
  trialEndsAt?: string
}
```

#### Requests Store (`stores/requests.ts`)
```typescript
interface ServiceRequest {
  id: string
  title: string
  description: string
  industry: string
  category: string
  location: string
  budget?: string
  deadline?: string
  status: 'open' | 'fulfilled' | 'closed'
  createdBy: string
  createdAt: string
  updatedAt: string
  attachments?: string[]
  customFields?: Record<string, any>
  responseCount: number
  viewCount: number
}

interface RequestResponse {
  id: string
  requestId: string
  responderId: string
  responderName: string
  responderRating: number
  message: string
  contactInfo: string
  attachments?: string[]
  price?: string
  timeline?: string
  createdAt: string
  isSelected: boolean
}
```

### Frontend Data Flow
1. **Authentication**: Mock login system (needs real OTP-based auth)
2. **Request Creation**: Multi-step form with dynamic fields based on industry/category
3. **Request Listing**: Filtered and searchable list with real-time updates
4. **Response System**: Users can respond to requests with contact info and pricing
5. **Status Management**: Request owners can select responses and mark as fulfilled

## Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    password VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    industries JSON, -- Array of industry names
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSON,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    subscription_status ENUM('trial', 'active', 'expired') DEFAULT 'trial',
    trial_ends_at DATETIME,
    last_payment_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    remember_token VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_subscription (subscription_status),
    INDEX idx_location (location)
);
```

#### Industries Table
```sql
CREATE TABLE industries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### Categories Table
```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    industry_id BIGINT UNSIGNED,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_per_industry (industry_id, slug)
);
```

#### Form Fields Table
```sql
CREATE TABLE form_fields (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED,
    field_name VARCHAR(255) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'number', 'date', 'select', 'textarea', 'checkbox', 'radio') DEFAULT 'text',
    placeholder VARCHAR(255),
    is_required BOOLEAN DEFAULT FALSE,
    validation_rules JSON,
    options JSON, -- For select/radio fields
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

#### Service Requests Table
```sql
CREATE TABLE service_requests (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    industry_id BIGINT UNSIGNED,
    category_id BIGINT UNSIGNED,
    location VARCHAR(255) NOT NULL,
    budget VARCHAR(255),
    deadline DATETIME,
    status ENUM('open', 'fulfilled', 'closed') DEFAULT 'open',
    created_by CHAR(36),
    custom_fields JSON, -- Dynamic field values
    attachments JSON, -- Array of file URLs
    response_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (industry_id) REFERENCES industries(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_status (status),
    INDEX idx_industry (industry_id),
    INDEX idx_category (category_id),
    INDEX idx_location (location),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);
```

#### Request Responses Table
```sql
CREATE TABLE request_responses (
    id CHAR(36) PRIMARY KEY,
    request_id CHAR(36),
    responder_id CHAR(36),
    message TEXT NOT NULL,
    contact_info VARCHAR(255) NOT NULL,
    price VARCHAR(255),
    timeline VARCHAR(255),
    attachments JSON,
    is_selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_request (request_id),
    INDEX idx_responder (responder_id),
    INDEX idx_selected (is_selected)
);
```

#### Reviews Table
```sql
CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_id CHAR(36),
    reviewer_id CHAR(36),
    reviewed_id CHAR(36),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES service_requests(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_id) REFERENCES users(id),
    
    UNIQUE KEY unique_review_per_request (request_id, reviewer_id, reviewed_id)
);
```

#### Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36),
    plan_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    payment_method VARCHAR(255),
    payment_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status)
);
```

#### Files Table
```sql
CREATE TABLE files (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    file_type ENUM('image', 'document', 'other') NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (file_type)
);
```

## Laravel Models

### User Model
```php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'business_name', 'contact_person', 'phone', 'email', 
        'location', 'industries', 'is_verified', 'subscription_status', 
        'trial_ends_at'
    ];
    
    protected $hidden = ['password', 'remember_token'];
    
    protected $casts = [
        'industries' => 'array',
        'verification_documents' => 'array',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'trial_ends_at' => 'datetime',
        'last_payment_at' => 'datetime',
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'rating' => 'decimal:2'
    ];
    
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = Str::uuid();
        });
    }
    
    // Relationships
    public function serviceRequests()
    {
        return $this->hasMany(ServiceRequest::class, 'created_by');
    }
    
    public function responses()
    {
        return $this->hasMany(RequestResponse::class, 'responder_id');
    }
    
    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }
    
    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewed_id');
    }
    
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
    
    public function files()
    {
        return $this->hasMany(File::class);
    }
    
    // Helper methods
    public function isTrialActive()
    {
        return $this->subscription_status === 'trial' && 
               $this->trial_ends_at && 
               $this->trial_ends_at->isFuture();
    }
    
    public function canPostRequests()
    {
        return $this->subscription_status === 'active' || $this->isTrialActive();
    }
}
```

### ServiceRequest Model
```php
class ServiceRequest extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'title', 'description', 'industry_id', 'category_id', 
        'location', 'budget', 'deadline', 'status', 'created_by', 
        'custom_fields', 'attachments'
    ];
    
    protected $casts = [
        'custom_fields' => 'array',
        'attachments' => 'array',
        'deadline' => 'datetime',
        'is_featured' => 'boolean'
    ];
    
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = Str::uuid();
        });
    }
    
    // Relationships
    public function industry()
    {
        return $this->belongsTo(Industry::class);
    }
    
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function responses()
    {
        return $this->hasMany(RequestResponse::class, 'request_id');
    }
    
    public function reviews()
    {
        return $this->hasMany(Review::class, 'request_id');
    }
    
    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }
    
    public function scopeByIndustry($query, $industryId)
    {
        return $query->where('industry_id', $industryId);
    }
    
    public function scopeByLocation($query, $location)
    {
        return $query->where('location', 'like', "%{$location}%");
    }
}
```

## API Routes & Endpoints

### Authentication Routes
```php
// routes/api.php
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});
```

**Expected Request/Response:**
```json
// POST /api/auth/register
{
  "business_name": "Mumbai Events Co.",
  "contact_person": "Rajesh Kumar",
  "phone": "+919876543210",
  "email": "rajesh@mumbaiEvents.com",
  "location": "Mumbai, Maharashtra",
  "industries": ["Travel & Hospitality"]
}

// Response
{
  "success": true,
  "message": "OTP sent to your phone",
  "data": {
    "user_id": "uuid",
    "otp_expires_at": "2024-01-20T10:35:00Z"
  }
}
```

### User Management Routes
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/profile', [UserController::class, 'profile']);
    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::post('/users/verify-business', [UserController::class, 'applyForVerification']);
    Route::get('/users/stats', [UserController::class, 'getStats']);
    Route::get('/users/{user}/reviews', [UserController::class, 'getReviews']);
    Route::post('/users/{user}/rate', [ReviewController::class, 'store']);
});
```

### Service Requests Routes
```php
Route::prefix('requests')->group(function () {
    Route::get('/', [ServiceRequestController::class, 'index']);
    Route::get('/{request}', [ServiceRequestController::class, 'show']);
    Route::post('/{request}/view', [ServiceRequestController::class, 'incrementView']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [ServiceRequestController::class, 'store']);
        Route::put('/{request}', [ServiceRequestController::class, 'update']);
        Route::delete('/{request}', [ServiceRequestController::class, 'destroy']);
        Route::patch('/{request}/status', [ServiceRequestController::class, 'updateStatus']);
        Route::post('/{request}/reopen', [ServiceRequestController::class, 'reopen']);
        
        // Responses
        Route::get('/{request}/responses', [ResponseController::class, 'index']);
        Route::post('/{request}/responses', [ResponseController::class, 'store']);
        Route::put('/responses/{response}', [ResponseController::class, 'update']);
        Route::delete('/responses/{response}', [ResponseController::class, 'destroy']);
        Route::post('/responses/{response}/select', [ResponseController::class, 'select']);
    });
});
```

**Expected Request/Response:**
```json
// GET /api/requests?industry=1&category=2&location=Mumbai&status=open&page=1
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": "uuid",
        "title": "Need 50 Hotel Bookings for Corporate Event",
        "description": "Looking for hotel accommodations...",
        "industry": {
          "id": 1,
          "name": "Travel & Hospitality"
        },
        "category": {
          "id": 2,
          "name": "Hotel Bookings"
        },
        "location": "Goa, India",
        "budget": "₹8,000 - ₹12,000 per room",
        "deadline": "2024-02-15T00:00:00Z",
        "status": "open",
        "custom_fields": {
          "numberOfRooms": "50",
          "checkInDate": "2024-02-10",
          "checkOutDate": "2024-02-13",
          "starRating": "4 Star"
        },
        "response_count": 8,
        "view_count": 45,
        "creator": {
          "id": "uuid",
          "business_name": "Demo Business",
          "rating": 4.5,
          "is_verified": true
        },
        "created_at": "2024-01-20T10:30:00Z"
      }
    ],
    "per_page": 15,
    "total": 150
  }
}
```

### Industry & Category Routes
```php
Route::prefix('industries')->group(function () {
    Route::get('/', [IndustryController::class, 'index']);
    Route::get('/{industry}/categories', [CategoryController::class, 'getByIndustry']);
});

Route::prefix('categories')->group(function () {
    Route::get('/{category}/fields', [FormFieldController::class, 'getByCategoryId']);
});
```

### File Upload Routes
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/files/upload', [FileController::class, 'upload']);
    Route::get('/files/{file}', [FileController::class, 'show']);
    Route::get('/files/{file}/download', [FileController::class, 'download']);
    Route::delete('/files/{file}', [FileController::class, 'destroy']);
});
```

### Subscription & Payment Routes
```php
Route::middleware('auth:sanctum')->prefix('subscriptions')->group(function () {
    Route::get('/plans', [SubscriptionController::class, 'getPlans']);
    Route::post('/start-trial', [SubscriptionController::class, 'startTrial']);
    Route::post('/upgrade', [SubscriptionController::class, 'upgrade']);
    Route::get('/current', [SubscriptionController::class, 'current']);
    Route::post('/cancel', [SubscriptionController::class, 'cancel']);
});

Route::middleware('auth:sanctum')->prefix('payments')->group(function () {
    Route::post('/create-order', [PaymentController::class, 'createOrder']);
    Route::post('/verify', [PaymentController::class, 'verifyPayment']);
    Route::get('/history', [PaymentController::class, 'getHistory']);
});
```

### Admin Routes
```php
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // User Management
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::put('/users/{user}/status', [AdminUserController::class, 'updateStatus']);
    Route::post('/users/{user}/verify', [AdminUserController::class, 'verifyBusiness']);
    
    // Content Management
    Route::get('/requests/flagged', [AdminRequestController::class, 'getFlagged']);
    Route::post('/requests/{request}/moderate', [AdminRequestController::class, 'moderate']);
    
    // Analytics
    Route::get('/analytics/overview', [AdminAnalyticsController::class, 'overview']);
    Route::get('/analytics/users', [AdminAnalyticsController::class, 'users']);
    Route::get('/analytics/requests', [AdminAnalyticsController::class, 'requests']);
    Route::get('/analytics/revenue', [AdminAnalyticsController::class, 'revenue']);
    
    // Industry/Category Management
    Route::apiResource('industries', AdminIndustryController::class);
    Route::apiResource('categories', AdminCategoryController::class);
    Route::apiResource('form-fields', AdminFormFieldController::class);
});
```

## Authentication System

### OTP-Based Authentication
```php
class AuthController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|regex:/^\+91[0-9]{10}$/'
        ]);
        
        $otp = rand(100000, 999999);
        $expiresAt = now()->addMinutes(5);
        
        // Store OTP in cache/database
        Cache::put("otp_{$request->phone}", [
            'otp' => $otp,
            'expires_at' => $expiresAt
        ], 300); // 5 minutes
        
        // Send SMS using service like Twilio/MSG91
        $this->sendSMS($request->phone, "Your VendorIQ OTP is: {$otp}");
        
        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully',
            'expires_at' => $expiresAt
        ]);
    }
    
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string|size:6'
        ]);
        
        $cachedOtp = Cache::get("otp_{$request->phone}");
        
        if (!$cachedOtp || $cachedOtp['otp'] !== $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP'
            ], 400);
        }
        
        if (now()->isAfter($cachedOtp['expires_at'])) {
            return response()->json([
                'success' => false,
                'message' => 'OTP expired'
            ], 400);
        }
        
        // Find or create user
        $user = User::where('phone', $request->phone)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found. Please register first.'
            ], 404);
        }
        
        // Mark phone as verified
        $user->update(['phone_verified_at' => now()]);
        
        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;
        
        // Clear OTP
        Cache::forget("otp_{$request->phone}");
        
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ]);
    }
}
```

## Dynamic Form System

### Form Field Configuration
```php
class FormFieldController extends Controller
{
    public function getByCategoryId(Category $category)
    {
        $fields = $category->formFields()->orderBy('sort_order')->get();
        
        return response()->json([
            'success' => true,
            'data' => $fields->map(function ($field) {
                return [
                    'field_name' => $field->field_name,
                    'field_label' => $field->field_label,
                    'field_type' => $field->field_type,
                    'placeholder' => $field->placeholder,
                    'is_required' => $field->is_required,
                    'validation_rules' => $field->validation_rules,
                    'options' => $field->options
                ];
            })
        ]);
    }
}
```

### Dynamic Validation
```php
class ServiceRequestController extends Controller
{
    public function store(Request $request)
    {
        // Basic validation
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'industry_id' => 'required|exists:industries,id',
            'category_id' => 'required|exists:categories,id',
            'location' => 'required|string|max:255',
            'budget' => 'nullable|string',
            'deadline' => 'nullable|date|after:today',
            'custom_fields' => 'array'
        ]);
        
        // Dynamic field validation
        $category = Category::findOrFail($request->category_id);
        $formFields = $category->formFields;
        
        $customFieldRules = [];
        foreach ($formFields as $field) {
            $rules = [];
            
            if ($field->is_required) {
                $rules[] = 'required';
            } else {
                $rules[] = 'nullable';
            }
            
            // Add type-specific validation
            switch ($field->field_type) {
                case 'number':
                    $rules[] = 'numeric';
                    break;
                case 'date':
                    $rules[] = 'date';
                    break;
                case 'email':
                    $rules[] = 'email';
                    break;
            }
            
            // Add custom validation rules
            if ($field->validation_rules) {
                $rules = array_merge($rules, $field->validation_rules);
            }
            
            $customFieldRules["custom_fields.{$field->field_name}"] = $rules;
        }
        
        if (!empty($customFieldRules)) {
            $request->validate($customFieldRules);
        }
        
        // Create request
        $validated['created_by'] = auth()->id();
        $serviceRequest = ServiceRequest::create($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Request created successfully',
            'data' => $serviceRequest->load(['industry', 'category', 'creator'])
        ], 201);
    }
}
```

## File Upload System

```php
class FileController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'type' => 'required|in:image,document'
        ]);
        
        $file = $request->file('file');
        $user = auth()->user();
        
        // Validate file type
        if ($request->type === 'image') {
            $request->validate([
                'file' => 'mimes:jpeg,png,jpg,gif,svg|max:5120' // 5MB for images
            ]);
        } else {
            $request->validate([
                'file' => 'mimes:pdf,doc,docx,xls,xlsx|max:10240' // 10MB for documents
            ]);
        }
        
        // Generate unique filename
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        
        // Store file (use S3 in production)
        $filePath = $file->storeAs('uploads/' . $user->id, $fileName, 'public');
        
        // Save file record
        $fileRecord = File::create([
            'user_id' => $user->id,
            'original_name' => $file->getClientOriginalName(),
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'file_type' => $request->type
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully',
            'data' => [
                'id' => $fileRecord->id,
                'url' => Storage::url($filePath),
                'original_name' => $fileRecord->original_name,
                'file_size' => $fileRecord->file_size
            ]
        ]);
    }
}
```

## Payment Integration

### Razorpay Integration
```php
class PaymentController extends Controller
{
    public function createOrder(Request $request)
    {
        $request->validate([
            'plan' => 'required|in:basic,premium',
            'duration' => 'required|in:monthly,yearly'
        ]);
        
        $plans = [
            'basic' => ['monthly' => 200, 'yearly' => 2000],
            'premium' => ['monthly' => 300, 'yearly' => 3000]
        ];
        
        $amount = $plans[$request->plan][$request->duration];
        
        $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
        
        $order = $api->order->create([
            'amount' => $amount * 100, // Amount in paise
            'currency' => 'INR',
            'receipt' => 'order_' . time(),
            'notes' => [
                'user_id' => auth()->id(),
                'plan' => $request->plan,
                'duration' => $request->duration
            ]
        ]);
        
        return response()->json([
            'success' => true,
            'data' => [
                'order_id' => $order['id'],
                'amount' => $amount,
                'currency' => 'INR',
                'key' => config('services.razorpay.key')
            ]
        ]);
    }
    
    public function verifyPayment(Request $request)
    {
        $request->validate([
            'razorpay_order_id' => 'required',
            'razorpay_payment_id' => 'required',
            'razorpay_signature' => 'required'
        ]);
        
        $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
        
        try {
            $api->utility->verifyPaymentSignature([
                'razorpay_order_id' => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature' => $request->razorpay_signature
            ]);
            
            // Payment verified, update user subscription
            $user = auth()->user();
            $user->update([
                'subscription_status' => 'active',
                'last_payment_at' => now()
            ]);
            
            // Create subscription record
            Subscription::create([
                'user_id' => $user->id,
                'plan_name' => $request->plan ?? 'basic',
                'amount' => $request->amount ?? 200,
                'payment_id' => $request->razorpay_payment_id,
                'starts_at' => now(),
                'ends_at' => now()->addMonth()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully'
            ]);
            
        } catch (SignatureVerificationError $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed'
            ], 400);
        }
    }
}
```

## Notifications

### Real-time Notifications
```php
// Use Laravel Broadcasting with Pusher or WebSockets
class NotificationController extends Controller
{
    public function sendNewResponseNotification($requestId, $responderId)
    {
        $request = ServiceRequest::find($requestId);
        $responder = User::find($responderId);
        
        // Send to request creator
        $request->creator->notify(new NewResponseNotification($request, $responder));
        
        // Broadcast real-time notification
        broadcast(new NewResponseEvent($request, $responder))->toOthers();
    }
}

// Notification class
class NewResponseNotification extends Notification
{
    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }
    
    public function toArray($notifiable)
    {
        return [
            'type' => 'new_response',
            'message' => "{$this->responder->business_name} responded to your request",
            'request_id' => $this->request->id,
            'request_title' => $this->request->title,
            'responder_name' => $this->responder->business_name
        ];
    }
}
```

## Implementation Priority

### Phase 1 (Core Features)
1. **Database Setup**: Create all tables and relationships
2. **Authentication**: OTP-based login/registration
3. **User Management**: Profile, verification system
4. **Industry/Category System**: Dynamic form configuration
5. **Service Requests**: CRUD operations with dynamic fields
6. **Response System**: Users can respond to requests
7. **Basic File Upload**: Image and document support

### Phase 2 (Business Features)
1. **Payment Integration**: Razorpay integration for subscriptions
2. **Subscription Management**: Trial, active, expired states
3. **Rating & Review System**: Post-project feedback
4. **Advanced Search**: Filters, sorting, pagination
5. **Notifications**: Real-time updates

### Phase 3 (Admin & Analytics)
1. **Admin Dashboard**: User management, content moderation
2. **Analytics**: Platform usage, revenue tracking
3. **Advanced Features**: Bulk operations, export functionality
4. **Performance Optimization**: Caching, indexing

### Phase 4 (Enhancements)
1. **Mobile API Optimization**: For future mobile apps
2. **Advanced Notifications**: Email, SMS integration
3. **AI Features**: Auto-matching, recommendations
4. **Third-party Integrations**: WhatsApp Business API

## Environment Configuration

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vendoriq
DB_USERNAME=root
DB_PASSWORD=

# Authentication
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000

# File Storage
FILESYSTEM_DISK=public
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=ap-south-1
AWS_BUCKET=

# Payment Gateway
RAZORPAY_KEY=
RAZORPAY_SECRET=

# SMS Service
MSG91_AUTH_KEY=
TWILIO_SID=
TWILIO_TOKEN=

# Broadcasting
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=ap2

# Cache
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

This comprehensive guide provides all the necessary information for backend developers to implement the VendorIQ Laravel API. The frontend is already built and ready to integrate with these endpoints.