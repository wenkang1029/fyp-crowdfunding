```
.
|-- .nvmrc  # Node version hint for tooling
|-- DESIGN_SYSTEM.md  # AidWise UI/UX and Tailwind design rules
|-- README.md  # Project overview, features, and setup steps
|-- .github/
|   |-- copilot-instructions.md  # Workspace guidance for Copilot
|-- backend/
|   |-- .editorconfig  # Backend editor defaults
|   |-- .env  # Local environment config (secrets)
|   |-- .env.example  # Environment variable template
|   |-- .gitattributes  # Git attributes for the backend
|   |-- .gitignore  # Git ignore rules for Laravel
|   |-- artisan  # Laravel CLI entrypoint
|   |-- composer.json  # PHP dependencies and autoloading
|   |-- composer.lock  # Locked PHP dependency versions
|   |-- package.json  # Vite build scripts for Laravel assets
|   |-- phpunit.xml  # PHPUnit configuration
|   |-- README.md  # Default Laravel readme
|   |-- vite.config.js  # Vite configuration for Laravel
|   |-- app/
|   |   |-- Console/
|   |   |   |-- Kernel.php  # Console command registration and scheduling
|   |   |-- Exceptions/
|   |   |   |-- Handler.php  # Global exception handler
|   |   |-- Http/
|   |   |   |-- Kernel.php  # HTTP middleware stack
|   |   |   |-- Controllers/
|   |   |   |   |-- AdminUserController.php  # Admin user management endpoints
|   |   |   |   |-- AllocationController.php  # Campaign allocation endpoints
|   |   |   |   |-- AuthController.php  # Login, register, logout API
|   |   |   |   |-- CampaignController.php  # Campaign CRUD and donations
|   |   |   |   |-- ChatbotController.php  # Dialogflow webhook handler
|   |   |   |   |-- Controller.php  # Base controller
|   |   |   |   |-- DashboardController.php  # NGO/admin dashboard metrics
|   |   |   |   |-- DisbursementController.php  # Disbursement requests and moderation
|   |   |   |   |-- DonationController.php  # Donations API and history
|   |   |   |   |-- NotificationController.php  # Notification read endpoints
|   |   |   |   |-- ProfileController.php  # Profile update endpoint
|   |   |   |   |-- ReportController.php  # PDF report generation
|   |   |   |   |-- SettingController.php  # Admin settings API
|   |   |   |-- Middleware/
|   |   |       |-- Authenticate.php  # Authentication middleware
|   |   |       |-- EncryptCookies.php  # Cookie encryption
|   |   |       |-- PreventRequestsDuringMaintenance.php  # Maintenance mode gate
|   |   |       |-- RedirectIfAuthenticated.php  # Redirect logged-in users
|   |   |       |-- TrimStrings.php  # Request string trimming
|   |   |       |-- TrustHosts.php  # Trusted host config
|   |   |       |-- TrustProxies.php  # Proxy config
|   |   |       |-- ValidateSignature.php  # Signed URL validation
|   |   |       |-- VerifyCsrfToken.php  # CSRF protection
|   |   |-- Models/
|   |   |   |-- Allocation.php  # Allocation model
|   |   |   |-- Campaign.php  # Campaign model
|   |   |   |-- Disbursement.php  # Disbursement model
|   |   |   |-- Donation.php  # Donation model
|   |   |   |-- Setting.php  # Settings model
|   |   |   |-- User.php  # User model
|   |   |-- Notifications/
|   |   |   |-- CampaignApprovedNotification.php  # NGO campaign approval notification
|   |   |-- Providers/
|   |   |   |-- AppServiceProvider.php  # Application service bindings
|   |   |   |-- AuthServiceProvider.php  # Authorization policies
|   |   |   |-- BroadcastServiceProvider.php  # Broadcast channel registration
|   |   |   |-- EventServiceProvider.php  # Event listeners registration
|   |   |   |-- RouteServiceProvider.php  # Route loading configuration
|   |-- bootstrap/
|   |   |-- app.php  # Laravel bootstrap
|   |-- config/
|   |   |-- app.php  # App config
|   |   |-- auth.php  # Auth guards and providers
|   |   |-- broadcasting.php  # Broadcast config
|   |   |-- cache.php  # Cache stores
|   |   |-- cors.php  # CORS policy
|   |   |-- database.php  # DB connections
|   |   |-- filesystems.php  # Storage disks
|   |   |-- hashing.php  # Hashing options
|   |   |-- logging.php  # Log channels
|   |   |-- mail.php  # Mail config
|   |   |-- queue.php  # Queue settings
|   |   |-- sanctum.php  # Sanctum auth config
|   |   |-- services.php  # Third-party services
|   |   |-- session.php  # Session config
|   |   |-- view.php  # View config
|   |-- database/
|   |   |-- factories/
|   |   |   |-- UserFactory.php  # User test data factory
|   |   |-- migrations/
|   |   |   |-- 2014_10_12_000000_create_users_table.php  # Users table
|   |   |   |-- 2014_10_12_100000_create_password_reset_tokens_table.php  # Password reset tokens table
|   |   |   |-- 2019_08_19_000000_create_failed_jobs_table.php  # Failed jobs table
|   |   |   |-- 2019_12_14_000001_create_personal_access_tokens_table.php  # Sanctum tokens table
|   |   |   |-- 2026_04_13_073401_create_campaigns_table.php  # Campaigns table
|   |   |   |-- 2026_04_13_073411_create_donations_table.php  # Donations table
|   |   |   |-- 2026_04_13_073422_create_allocations_table.php  # Allocations table
|   |   |   |-- 2026_04_16_145313_create_disbursements_table.php  # Disbursements table
|   |   |   |-- 2026_04_17_032417_create_settings_table.php  # Settings table
|   |   |   |-- 2026_04_17_033254_add_allocation_id_to_donations_table.php  # Adds allocation_id FK to donations
|   |   |   |-- 2026_04_17_065549_create_notifications_table.php  # Notifications table
|   |   |-- seeders/
|   |   |   |-- DatabaseSeeder.php  # Seeder registry
|   |-- public/
|   |   |-- .htaccess  # Apache rewrite rules
|   |   |-- favicon.ico  # App favicon
|   |   |-- index.php  # HTTP entrypoint
|   |   |-- robots.txt  # Crawler directives
|   |-- resources/
|   |   |-- css/
|   |   |   |-- app.css  # Laravel asset CSS (currently empty)
|   |   |-- js/
|   |   |   |-- app.js  # Laravel JS entrypoint
|   |   |   |-- bootstrap.js  # Axios setup and optional Echo config
|   |   |-- views/
|   |   |   |-- welcome.blade.php  # Default Laravel welcome page
|   |   |   |-- reports/
|   |   |       |-- allocation.blade.php  # Allocation PDF report template
|   |   |       |-- disbursement.blade.php  # Disbursement PDF report template
|   |-- routes/
|   |   |-- api.php  # API route definitions
|   |   |-- channels.php  # Broadcast channels
|   |   |-- console.php  # Artisan command routes
|   |   |-- web.php  # Web routes
|   |-- tests/
|   |   |-- CreatesApplication.php  # Test app bootstrap
|   |   |-- TestCase.php  # Base test case
|   |   |-- Feature/
|   |   |   |-- ExampleTest.php  # Feature test stub
|   |   |-- Unit/
|   |       |-- ExampleTest.php  # Unit test stub
|-- docs/
|   |-- architecture.md  # Architecture notes
|   |-- dev-principles.md  # Development principles
|   |-- system-overview.md  # System modules and scope
|   |-- modules/
|   |   |-- core-modules.md  # Core module specs
|   |   |-- llm-modules.md  # LLM module specs
|   |-- progress/
|   |   |-- completed.md  # Progress checklist (this file)
|   |   |-- file-structure-raw.txt  # Raw tree snapshot
|   |   |-- file-structure.md  # Annotated tree (this file)
|   |   |-- plan.md  # Planning notes
|   |-- prompts/
|       |-- code-review.md  # Code review prompt
|       |-- debug.md  # Debug prompt
|       |-- new-feature.md  # New feature prompt
|-- frontend/
|   |-- eslint.config.js  # ESLint configuration
|   |-- index.html  # Frontend HTML shell
|   |-- package.json  # Frontend dependencies and scripts
|   |-- postcss.config.js  # PostCSS plugins
|   |-- README.md  # Vite template readme
|   |-- tailwind.config.js  # Tailwind theme and tokens
|   |-- vite.config.js  # Vite configuration
|   |-- public/
|   |   |-- (empty)  # Static assets (none listed)
|   |-- src/
|   |   |-- App.css  # Default Vite demo styles (unused)
|   |   |-- App.jsx  # React router and layout wiring
|   |   |-- index.css  # Tailwind base and global styles
|   |   |-- main.jsx  # React entrypoint
|   |   |-- api/
|   |   |   |-- axios.js  # Axios instance with auth token interceptor
|   |   |-- assets/
|   |   |   |-- (not listed)  # Frontend assets
|   |   |-- components/
|   |   |   |-- ProtectedRoute.jsx  # Role-based route guard
|   |   |   |-- layout/
|   |   |   |   |-- DashboardLayout.jsx  # Sidebar layout for dashboards
|   |   |   |   |-- Navbar.jsx  # Top navigation bar
|   |   |   |-- ui/
|   |   |       |-- Avatar.jsx  # Initials avatar
|   |   |       |-- Badge.jsx  # Status badge
|   |   |       |-- Button.jsx  # Styled button
|   |   |       |-- Card.jsx  # Card container
|   |   |       |-- CampaignCard.jsx  # Campaign summary card
|   |   |       |-- CheckoutModal.jsx  # Mock payment modal
|   |   |       |-- DonationLedger.jsx  # Donation history table
|   |   |       |-- Input.jsx  # Styled text input
|   |   |       |-- Modal.jsx  # Generic modal
|   |   |       |-- StatCard.jsx  # Metric card
|   |   |       |-- Textarea.jsx  # Styled textarea
|   |   |-- context/
|   |   |   |-- AuthContext.jsx  # Auth state provider and hook
|   |   |-- pages/
|   |       |-- AdminDashboard.jsx  # Admin campaign moderation UI
|   |       |-- AdminDisbursements.jsx  # Admin payout moderation UI
|   |       |-- CampaignDetails.jsx  # Campaign details and donation flow
|   |       |-- CreateCampaign.jsx  # NGO campaign creation form
|   |       |-- DonorDashboard.jsx  # Donor impact dashboard
|   |       |-- Home.jsx  # Public campaign gallery
|   |       |-- Login.jsx  # Login form
|   |       |-- NgoDashboard.jsx  # NGO overview dashboard
|   |       |-- NgoDisbursements.jsx  # NGO disbursement dashboard
```
