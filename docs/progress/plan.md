# Development Plan

Last updated: 2026-04-23

## Status Legend
- [ ] Not started
- [~] In progress — describe what's done and what's missing
- [x] Done
- [!] Blocked — reason

## Phase 1 — Core Modules

### 1. Auth & Profile
- [~] Backend: AuthController register/login/logout and ProfileController update exist; no service layer; User model relationships missing
- [~] Frontend: Login page + AuthContext + ProtectedRoute exist; no auth service layer
- Notes: Registration only covers name/email/password/role; no org details

### 2. Campaign Management
- [~] Backend: CampaignController CRUD + donate exist; Campaign model relationships exist; no service layer
- [~] Frontend: Home, CampaignDetails, CreateCampaign, AdminDashboard, NgoDashboard pages exist; no campaign service layer or hooks
- Notes: Campaign deadline not present in schema

### 3. Donation Flow
- [~] Backend: DonationController store/index and CampaignController donate exist; no service layer; Stripe and PDF receipt not implemented
- [~] Frontend: Home, CampaignDetails, DonorDashboard pages exist with mock payment modal; no donation service layer or hooks
- Notes: Donations table has donor_name but controllers/models do not set it

### 4. Fund Allocation & Disbursement
- [~] Backend: AllocationController store/update, DisbursementController store/indexAdmin/updateStatus, ReportController PDF endpoints exist; no service layer
- [~] Frontend: NgoDisbursements page exists; allocation CRUD UI not present; no service layer or hooks
- Notes: Frontend sends rejection_reason but backend has no field

### 5. Live Dashboard
- [~] Backend: DashboardController NGO/Admin/Disbursement metrics endpoints exist; no service layer
- [~] Frontend: NgoDashboard, DonorDashboard, AdminDashboard, NgoDisbursements pages exist; no dashboard service layer or hooks
- Notes: NgoDashboard uses hardcoded Total Donors

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
- Services layer structure: app/Services not yet created
- React hooks/services folders: hooks/ and services/ not yet created

## Next 3 Tasks
- Add backend service layer for Auth/Campaign/Donation/Allocation/Disbursement/Dashboard and wire controllers to services
- Add frontend API service modules and hooks to remove inline axios usage in pages
- Build missing frontend modules for Chatbot widget and Notifications UI
