# Development Plan

Last updated: 2026-06-09

## Status Legend
- [ ] Not started
- [~] In progress — describe what's done and what's missing
- [x] Done
- [!] Blocked — reason

## Phase 1 — Core Modules

### 1. Auth & Profile
- [x] Backend: AuthService and ProfileService added; AuthController/ProfileController now thin and service-backed; /user endpoint response standardized
- [x] Frontend: authService + useAuthForm hook added; Login/AuthContext now use service/hook layers
- Notes: Registration only covers name/email/password/role; no org details

### 2. Campaign Management
- [x] Backend: CampaignService added; CampaignController CRUD moved to service-backed flow; campaign fillable typo fixed; NGO campaign details endpoint added
- [x] Frontend: campaignService + useCreateCampaign hook added; Home/CampaignDetails/CreateCampaign/AdminDashboard/NgoDashboard integrated with service/hook; NGO campaign details page added
- Notes: Campaign start/end dates schema and validation implemented

### 3. Donation Flow
- [~] Backend: DonationService added; DonationController + CampaignController donate now service-backed; donor_name now set and model fillable updated; allocation progress redistributes overall donations; PDF receipt download added; missing: GET /donations/{id} and allocation list endpoint for donation preference UI
- [x] Frontend: donationService + useDonationFlow hook added; CampaignDetails/DonorDashboard/DonationLedger now use service/hook layer; receipt download wired into donor history
- Notes: Stripe still not implemented

### 4. Fund Allocation & Disbursement
- [x] Backend: AllocationService and DisbursementService added; controllers now thin/service-backed; rejection_reason migration and handling added
- [~] Frontend: disbursementService/allocationService + useNgoDisbursements hook added; NgoDisbursements/AdminDisbursements wired to service/hook; NGO campaign details supports editing campaign info and allocations (create/edit) using NGO campaign details endpoint; delete/list API still missing
- Notes: Allocation delete/list API endpoints still not implemented

### 5. Live Dashboard
- [x] Backend: DashboardService added and DashboardController now thin/service-backed
- [x] Frontend: dashboardService + useNgoDashboardData hook added and wired into NgoDashboard
- Notes: NgoDashboard hardcoded donors removed (computed from donation data)

### 6. AI Chatbot
- [x] Backend: ChatbotController webhook exists
- [x] Frontend: chatbotService, useChatbot hook, and ChatbotWidget component implemented and integrated globally via Navbar
- Notes: Local FAQ fallback matches with fallback dialogflow webhook for database active campaigns query

### 7. Notifications
- [~] Backend: NotificationController index/markAsRead/markAllAsRead exist; CampaignApprovedNotification exists
- [ ] Frontend: No notification UI/components/services
- Notes: FCM deferred (per architecture)

## Phase 2 — LLM Modules (after Phase 1 complete)

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
- Payment gateway: Stripe is listed in architecture but not implemented
- Notifications delivery: Firebase Cloud Messaging is deferred
- Services layer structure: app/Services initialized and active across core modules
- React hooks/services folders: hooks/ and services/ initialized and active across core modules

## Next 6 Tasks
- [x] Add Start Date and End Date for Campaign where when creating a campaign need to set the Dates. Donation can only be done on the active dates. Out of Start Date and End Date campaign's status should be change accordingly. Start Date and End Date cannot be edited. (COMPLETED: migration, model casts, validations, scheduler command, client validations)
- [ ] Add use case of user create account. Only donor and Ngo account can be created. 
- [ ] Build CRUD of User, Ngo and Campaigns for Admin 
- [x] Build missing frontend modules for Chatbot widget (COMPLETED: ChatbotWidget component, useChatbot hook, chatbotService, integrated in CampaignDetails page)
- [ ] Build missing frontend modules for Notifications UI
- [ ] Implement Stripe payment integration and wire real payment intent flow into donation UX
