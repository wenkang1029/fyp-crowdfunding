# Development Plan

Last updated: 2026-04-23

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
- [x] Backend: CampaignService added; CampaignController CRUD moved to service-backed flow; campaign fillable typo fixed
- [x] Frontend: campaignService + useCreateCampaign hook added; Home/CampaignDetails/CreateCampaign/AdminDashboard/NgoDashboard integrated with service/hook
- Notes: Campaign deadline not present in schema

### 3. Donation Flow
- [~] Backend: DonationService added; DonationController + CampaignController donate now service-backed; donor_name now set and model fillable updated; allocation progress redistributes overall donations
- [x] Frontend: donationService + useDonationFlow hook added; CampaignDetails/DonorDashboard/DonationLedger now use service/hook layer
- Notes: Stripe and PDF receipt still not implemented

### 4. Fund Allocation & Disbursement
- [x] Backend: AllocationService and DisbursementService added; controllers now thin/service-backed; rejection_reason migration and handling added
- [~] Frontend: disbursementService/allocationService + useNgoDisbursements hook added; NgoDisbursements/AdminDisbursements wired to service/hook; CampaignDetails shows sub-goal donut progress
- Notes: Allocation CRUD UI pages are still not implemented

### 5. Live Dashboard
- [x] Backend: DashboardService added and DashboardController now thin/service-backed
- [x] Frontend: dashboardService + useNgoDashboardData hook added and wired into NgoDashboard
- Notes: NgoDashboard hardcoded donors removed (computed from donation data)

### 6. AI Chatbot
- [~] Backend: ChatbotController webhook exists; no service layer
- [ ] Frontend: No chatbot widget/components/services
- Notes: Frontend integration missing

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

## Next 3 Tasks
- Implement PDF donation receipt generation and expose receipt download flow
- Build missing frontend modules for Chatbot widget and Notifications UI
- Implement Stripe payment integration and wire real payment intent flow into donation UX
