# Development Plan

Last updated: 2026-06-23

## Status Legend
- [ ] Not started
- [~] In progress — describe what's done and what's missing
- [x] Done
- [!] Blocked — reason

## Phase 1 — Core Modules

### 1. Auth & Profile
- [x] Backend: AuthService and ProfileService added; AuthController/ProfileController now thin and service-backed; /user endpoint response standardized; AdminUserController store endpoint added for admin-driven user creation. Gated Donor Profile lookup with PDPA 2010 compliance. Supports uploading and replacing NGO document credentials (solicitation permit and LHDN tax certificate) in local/cloud public storage.
- [x] Frontend: authService + useAuthForm + useRegisterForm hooks added; Login/Register/AuthContext now use service/hook layers. Added UserProfile settings page for Donor and NGO details CRUD, and NgoProfileView modal.
- Notes: Public registration restricted to donor and NGO roles; NGO details (org_name, org_reg_number, org_description) persisted in users table; Admin user creation supported via secure endpoint. Added status badges in profile page showing Account status (Active/Suspended), Verification status (✓ Verified NGO / Pending Verification), and Tax Exemption status. Added "Back to Dashboard" navigation link for donors on the User Profile settings page.

### 2. Campaign Management
- [x] Backend: CampaignService added; CampaignController CRUD moved to service-backed flow; campaign fillable typo fixed; NGO campaign details endpoint added. Multiple image uploads validation rules (`images.*`) and processing implemented; `image_paths` stored as JSON array; fallback routing added to serve files dynamically on environments where symlink is broken (e.g. DigitalOcean).
- [x] Frontend: campaignService + useCreateCampaign hook added; Home/CampaignDetails/CreateCampaign/AdminDashboard/NgoDashboard integrated with service/hook; NGO campaign details page added. Stepping wizard stepper updated to support uploading up to 5 images; "Use Default Image" testing helper toggle added to bypass file selection; interactive slideshow carousel with left/right arrows, position dots, and counter badge added to Campaign Details page; cover images completely removed from the Active Campaign List cards.
- Notes: Campaign start/end dates schema and validation implemented. Cover images mapped correctly.

### 3. Donation Flow
- [x] Backend: DonationService added; DonationController + CampaignController donate now service-backed; donor_name now set and model fillable updated; allocation progress redistributes overall donations; PDF receipt download added with sequential receipt numbers, LHDN validation reference codes, and Ringgit Malaysia spell-out text.
- [x] Frontend: donationService + useDonationFlow hook added; CampaignDetails/DonorDashboard/DonationLedger now use service/hook layer; receipt download wired into donor history with click blockers and loading indicators. CheckoutModal includes LHDN tax exemption request checkbox and fields pre-filled from Donor profile.
- Notes: Mock payment flow supports Card, FPX, and QR methods.

### 4. Fund Allocation & Disbursement
- [x] Backend: AllocationService and DisbursementService added; controllers now thin/service-backed; rejection_reason migration and handling added. Added PDF campaign summary report generator streaming donations and payouts.
- [x] Frontend: disbursementService/allocationService + useNgoDisbursements hook added; NgoDisbursements/AdminDisbursements wired to service/hook; NGO campaign details supports editing campaign info and allocations (create/edit). Added Export Campaign Report button downloading campaign summary layout.
- Notes: Allocation deletion and listing APIs integrated.

### 5. Live Dashboard
- [x] Backend: DashboardService added and DashboardController now thin/service-backed.
- [x] Frontend: dashboardService + useNgoDashboardData hook added and wired into NgoDashboard. Interactive options, tooltips, and animations configured.
- Notes: NgoDashboard hardcoded donors removed (computed from donation data).

### 6. AI Chatbot
- [x] Backend: ChatbotController webhook exists.
- [x] Frontend: chatbotService, useChatbot hook, and ChatbotWidget component implemented and integrated globally via Navbar.
- Notes: Local FAQ fallback matches with fallback dialogflow webhook for database active campaigns query.

### 7. Notifications
- [x] Backend: NotificationController index/markAsRead/markAllAsRead exist; CampaignApprovedNotification exists.
- [x] Frontend: Notifications dropdown integrated in Navbar and sidebar. Displays relative times and handles deep routing deep-linking and optimistic updates.
- Notes: FCM deferred.

## Phase 2 — LLM Modules

### L1. Disbursement Reconciliation
- [ ] Backend: No routes/services/models/migrations
- [ ] Frontend: No upload/report/confirmation UI

### L2. NGO Verification Pre-Check
- [ ] Backend: No routes/services/migrations
- [ ] Frontend: No admin review UI

### L3. Quotation-to-Allocation Generator
- [ ] Backend: No routes/services
- [ ] Frontend: No upload/review UI

## Open Decisions
- Payment gateway: Stripe is listed in architecture but not implemented (mocked payment flow active)
- Notifications delivery: Firebase Cloud Messaging is deferred
- Services layer structure: app/Services initialized and active across core modules
- React hooks/services folders: hooks/ and services/ initialized and active across core modules
