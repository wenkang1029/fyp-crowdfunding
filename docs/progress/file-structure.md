```
.
|-- DESIGN_SYSTEM.md  # AidWise UI/UX design tokens and tailwind style reference
|-- README.md  # Project summary, environment configuration, and startup instructions
|-- .nvmrc  # Node version specification
|-- docs/
|   |-- architecture.md  # Tech stack overview, role definitions, and API designs
|   |-- dev-principles.md  # Key developer guidelines and clean architecture rules
|   |-- system-overview.md  # System scope, roles, and core module overview
|   |-- modules/
|   |   |-- core-modules.md  # Functional specifications of the core features
|   |   |-- llm-modules.md  # Functional specifications of the AI integrations
|   |-- progress/
|       |-- completed.md  # Log of completed database tables, controllers, and pages
|       |-- file-structure.md  # Annotated file structure (this file)
|       |-- file-structure-raw.txt  # Raw recursive project files list
|       |-- plan.md  # Project implementation status checklist
|-- backend/
|   |-- artisan  # Laravel CLI helper
|   |-- composer.json  # PHP dependencies
|   |-- phpunit.xml  # Backend test suite settings
|   |-- vite.config.js  # Vite compiler configuration
|   |-- app/
|   │   |-- Exceptions/
|   │   │   |-- Handler.php  # Global API error standardizer
|   │   |-- Http/
|   │   │   |-- Kernel.php  # HTTP middleware stack registrations
|   │   │   |-- Controllers/
|   │   │   │   |-- AdminUserController.php  # User creation & status management
|   │   │   │   |-- AllocationController.php  # Sub-goal allocations and AI generation
|   │   │   │   |-- AuthController.php  # Sanctum login, logout, and registration
|   │   │   │   |-- CampaignController.php  # Campaign CRUD and donation portals
|   │   │   │   |-- ChatbotController.php  # Dialogflow NLP message proxies
|   │   │   │   |-- DashboardController.php  # Aggregated analytical charts data
|   │   │   │   |-- DisbursementController.php  # Payouts, reviews, and proof files CRUD
|   │   │   │   |-- DonationController.php  # Donation records and receipt actions
|   │   │   │   |-- NotificationController.php  # Bell alerts read managers
|   │   │   │   |-- ProfileController.php  # User settings updates
|   │   │   │   |-- ReportController.php  # PDF document generation streams
|   │   │   │   |-- SettingController.php  # Global system options
|   │   │   │   |-- StripeController.php  # Connect onboarding and webhooks processing
|   │   │   |-- Middleware/
|   │   │       |-- EnsureUserIsActive.php  # Blocks suspended user requests
|   │   |-- Models/
|   │   │   |-- Allocation.php  # Campaign sub-goals (with proportional waterfall)
|   │   │   |-- Campaign.php  # Campaign records and media list cast
|   │   │   |-- Disbursement.php  # Verified payouts, receipts, and proof files list
|   │   │   |-- Donation.php  # Donation transaction records
|   │   │   |-- Setting.php  # Key-value system options
|   │   │   |-- User.php  # Accounts (admin, ngo, donor)
|   │   |-- Notifications/
|   │   │   |-- CampaignApprovedNotification.php  # Approved campaign alerts
|   │   │   |-- CampaignGoalReachedNotification.php  # Campaign goal achieved alerts
|   │   │   |-- DisbursementDecidedNotification.php  # Payout status changes alert
|   │   │   |-- DonationReceivedNotification.php  # NGO new funds incoming alert
|   │   │   |-- DonationSuccessNotification.php  # Donor payment success receipts
|   │   │   |-- NewCampaignSubmittedNotification.php  # Admin review warning alerts
|   │   │   |-- NewDisbursementRequestNotification.php  # Admin payout request alerts
|   │   │   |-- NewNgoRegisteredNotification.php  # Admin NGO registration review alerts
|   │   |-- Providers/
|   │   │   |-- AppServiceProvider.php  # Global bindings
|   │   │   |-- AuthServiceProvider.php  # Access control policies
|   │   │   |-- RouteServiceProvider.php  # Route load configs
|   │   |-- Services/
|   │   │   |-- AllocationService.php  # Allocation logic and waterfall balances
|   │   │   |-- AuthService.php  # Sanctum user session logic
|   │   │   |-- CampaignService.php  # Campaign updates, validations, and images
|   │   │   |-- DashboardService.php  # Analytics aggregations
|   │   │   |-- DisbursementService.php  # Escrow disbursement rules
|   │   │   |-- DonationService.php  # DomPDF receipt builder and payment settlements
|   │   │   |-- GeminiService.php  # Gemini 2.5 Flash document parser (L3 Generator)
|   │   │   |-- ProfileService.php  # NGO validation credentials
|   │   │   |-- ReportService.php  # Campaign report summaries exporter
|   |-- config/
|   │   |-- services.php  # API keys config (Stripe, Gemini, Dialogflow)
|   |-- database/
|   │   |-- migrations/
|   │   │   |-- 2014_10_12_000000_create_users_table.php  # Users table
|   │   │   |-- 2026_04_13_073401_create_campaigns_table.php  # Campaigns table
|   │   │   |-- 2026_04_13_073411_create_donations_table.php  # Donations table
|   │   │   |-- 2026_04_13_073422_create_allocations_table.php  # Allocations table
|   │   │   |-- 2026_04_16_145313_create_disbursements_table.php  # Disbursements table
|   │   │   |-- 2026_06_22_103710_add_document_paths_to_users_table.php  # NGO credentials paths
|   │   │   |-- 2026_06_22_155500_add_image_paths_to_campaigns_table.php  # Multi-image arrays path
|   │   │   |-- 2026_06_24_084805_add_proof_images_to_disbursements_table.php  # Proof files array
|   |-- resources/
|   │   |-- views/
|   │   │   |-- reports/
|   │   │       |-- donation-receipt.blade.php  # DOMPDF receipt template
|   │   │       |-- summary.blade.php  # Campaign report export template
|   |-- routes/
|   │   |-- api.php  # REST API route endpoints
|   |-- tests/
|   │   |-- Feature/
|   │   │   |-- AdminManagementTest.php  # Gated admin management test suites
|   │   │   |-- AllocationGeneratorTest.php  # AI allocations parsing mock tests
|   │   │   |-- BackendNotificationTest.php  # Notification event triggers test suites
|   │   │   |-- CampaignReportTest.php  # Campaign summary reports download test suites
|   │   │   |-- DonationTest.php  # Split allocation donation checkout test suites
|   │   │   |-- RegistrationTest.php  # Multi-step authentication validators test suites
|-- frontend/
|   |-- tailwind.config.js  # Color tokens and component stylesheets
|   |-- vite.config.js  # Rolldown bundler settings
|   |-- src/
|   │   |-- App.jsx  # React router routing tree
|   │   |-- index.css  # CSS custom utility classes
|   │   |-- main.jsx  # App mounting file
|   │   |-- api/
|   │   │   |-- axios.js  # Intercepted axios connection client
|   │   |-- components/
|   │   │   |-- ProtectedRoute.jsx  # Access guard middleware
|   │   │   |-- layout/
|   │   │   │   |-- DashboardLayout.jsx  # Sidebar panel shell
|   │   │   │   |-- Navbar.jsx  # Floating sticky navbar
|   │   │   |-- ui/
|   │   │       |-- CampaignCard.jsx  # Horizontal campaign summaries
|   │   │       |-- CheckoutModal.jsx  # Stripe Elements payments wrapper
|   │   │       |-- DonorImpactModal.jsx  # Proportional utilization & proof tracker
|   │   │       |-- Modal.jsx  # Dynamic size wrapper
|   │   │       |-- NotificationDropdown.jsx  # Live unread alerts dropdown
|   │   |-- hooks/
|   │   │   |-- useAuthForm.js  # Login validators hook
|   │   │   |-- useRegisterForm.js  # Multi-step register hook
|   │   │   |-- useCreateCampaign.js  # Wizard creator hook
|   │   │   |-- useDonationFlow.js  # Payment lifecycle and date checks hook
|   │   │   |-- useDonationReceipt.js  # PDF download hook
|   │   │   |-- useNgoCampaigns.js  # NGO campaigns actions hook
|   │   │   |-- useNgoCampaignDetails.js  # NGO media slides modifier hook
|   │   │   |-- useNgoDisbursements.js  # NGO payout allocations checklist hook
|   │   │   |-- useNgoDashboardData.js  # NGO analytical loading hook
|   │   │   |-- useChatbot.js  # NLP widget flow hook
|   │   │   |-- useNotifications.js  # Bell alerts hook
|   │   |-- services/
|   │   │   |-- authService.js  # Account credentials client
|   │   │   |-- campaignService.js  # Campaigns CRUD and AI generator client
|   │   │   |-- chatbotService.js  # NLP chatbot messages client
|   │   │   |-- dashboardService.js  # Analytics stats client
|   │   │   |-- disbursementService.js  # Escrow payouts and proof uploads client
|   │   │   |-- donationService.js  # Stripe intents and receipt download client
|   │   │   |-- notificationService.js  # Alerts list read marks client
|   │   |-- pages/
|   │   │   |-- AdminDashboard.jsx  # Admin campaigns audit workspace
|   │   │   |-- AdminDisbursements.jsx  # Admin payouts audit workspace
|   │   │   |-- CampaignDetails.jsx  # Campaigns page (tabs, subgoals, sliders)
|   │   │   |-- CreateCampaign.jsx  # NGO campaign wizard (+ AI Budget Upload)
|   │   │   |-- DonorDashboard.jsx  # Donor history (+ Proportional Trackers)
|   │   │   |-- Home.jsx  # AidWise home campaign list
|   │   │   |-- Login.jsx  # Session login form
|   │   │   |-- NgoCampaigns.jsx  # NGO campaigns panel
|   │   │   |-- NgoCampaignDetails.jsx  # NGO funding metrics workspace
|   │   │   |-- NgoDashboard.jsx  # NGO overview analytics
|   │   │   |-- NgoDisbursements.jsx  # NGO payouts ledger & proof slideshow
|   │   │   |-- UserProfile.jsx  # NGO documents and status setting page
```
