Core Modules
Reference: docs/system-overview.md
Last updated: 2026-04-23

Status Overview
| # | Module | Backend | Frontend | Overall |
|---|---|---|---|---|
| 1 | Auth & Profile | [~] | [~] | [~] |
| 2 | Campaign Management | [x] | [x] | [x] |
| 3 | Donation Flow | [~] | [~] | [~] |
| 4 | Fund Allocation & Disbursement | [~] | [~] | [~] |
| 5 | Live Dashboard | [~] | [~] | [~] |
| 6 | AI Chatbot (FAQ) | [~] | [ ] | [~] |
| 7 | Notifications | [~] | [ ] | [~] |

Legend: [ ] Not started · [~] In progress · [x] Done · [!] Blocked · [?] Uncertain

Module 1 — Auth & Profile
What it does
Role-based login/register; profile management per role.

Backend

Routes: POST /register, POST /login, POST /logout, GET /user, PATCH /profile
Controller: AuthController — register [done], login [done], logout [done]; ProfileController — update [done]
Service: AuthService — missing
Model: User.php — relationships not defined (missing campaign/donation/notification relationships)

Frontend

Pages: Login.jsx
Components: ProtectedRoute.jsx, Navbar.jsx, ui/Input.jsx, ui/Button.jsx, ui/Card.jsx
Hook: useAuth (AuthContext.jsx)
Service: authService.js — missing

Acceptance Criteria

 Donor can register with name, email, password
 NGO admin can register with organisation details
 All roles can log in and receive a Sanctum token
 All roles can view and update their profile
 Protected routes reject unauthenticated requests with 401

Notes
NGO organisation details are not present in the current register flow. [?]
ProtectedRoute expects allowedRoles but some routes pass allowedRole, so role gating is inconsistent.

Module 2 — Campaign Management
What it does
NGO creates, edits, and closes campaigns with goals and deadlines. Campaign date window (`start_date`/`end_date`) support added; dates are set on creation and cannot be modified by NGO edits. The backend enforces that donations are accepted only when `status === 'active'` and the current time is within the campaign window. A scheduled command reconciles statuses by date.


Backend

Routes: GET /campaigns, GET /campaigns/{id}, POST /campaigns, PUT /campaigns/{id}, PATCH /campaigns/{id}, DELETE /campaigns/{id}
Controller: CampaignController — index [done], store [done], show [done], update [done], destroy [done], donate [done]
Service: CampaignService — done (create/update/status logic updated to persist dates and prevent NGO edits to dates)
Model: Campaign.php — belongsTo user; hasMany allocations, disbursements, donations; casts for `start_date` and `end_date`

Frontend

Pages: Home.jsx, CampaignDetails.jsx, CreateCampaign.jsx, NgoDashboard.jsx, AdminDashboard.jsx
Components: ui/CampaignCard.jsx, ui/Card.jsx, ui/Badge.jsx, ui/StatCard.jsx
Hook: useCampaigns — missing
Service: campaignService.js — missing

Acceptance Criteria

 NGO admin can create a campaign with title, description, goal amount, deadline
 NGO admin can edit and close a campaign
 Admin can approve or reject a campaign
 All users can view a list of active campaigns
 Campaign shows real-time progress bar toward goal

Notes
Campaign model `$fillable` updated to include `start_date` and `end_date`. A migration was added to append `start_date` and `end_date` to the `campaigns` table. NGO updates cannot modify these dates; admins may override via admin-only flows if required.

Module 3 — Donation Flow
What it does
Donor-facing campaign browsing -> secure payment gateway -> auto-receipt (PDF) via email.

Backend

Routes: POST /campaigns/{id}/donate, POST /donations, GET /donations
Controller: DonationController — store [done], index [done]; CampaignController — donate [done]
Service: DonationService — missing
Model: Donation.php — belongsTo user, campaign, allocation
Payment: Stripe integration — not yet
PDF Receipt: DomPDF receipt generation — not yet

Frontend

Pages: Home.jsx, CampaignDetails.jsx, DonorDashboard.jsx
Components: ui/CheckoutModal.jsx, ui/Modal.jsx, ui/Input.jsx, ui/Button.jsx, ui/Badge.jsx
Hook: useDonation — missing
Service: donationService.js — missing

Acceptance Criteria

 Donor can browse and filter active campaigns
 Donor can select a campaign and enter donation amount
 Payment is processed via Stripe (test mode)
 Donation record is saved on successful payment
 PDF receipt is auto-generated and available to donor
 Donor receives confirmation notification

Notes
Stripe payment and PDF receipts are not implemented yet.
Donations table has donor_name but the model fillable does not include it and controllers do not set it.

Module 4 — Fund Allocation & Disbursement
What it does
NGO allocates/reallocates funds across sub-categories; tracks disbursement with audit trail.

Backend

Routes: POST /campaigns/{campaign_id}/allocations, PATCH /campaigns/{campaign_id}/allocations/{id}, POST /campaigns/{campaign_id}/disbursements, GET /admin/disbursements, PATCH /admin/disbursements/{id}/status, GET /campaigns/{campaign_id}/reports/allocations, GET /campaigns/{campaign_id}/reports/disbursements
Controller: AllocationController — store [done], update [done]; DisbursementController — store [done], indexAdmin [done], updateStatus [done]; ReportController — allocationReport [done], disbursementReport [done]
Service: AllocationService/DisbursementService — missing
Models: Allocation.php — belongsTo campaign (missing hasMany donations); Disbursement.php — belongsTo campaign

Frontend

Pages: NgoDisbursements.jsx
Components: ui/StatCard.jsx, ui/Modal.jsx, ui/Input.jsx, ui/Button.jsx, ui/Badge.jsx
Hook: useDisbursements — missing
Service: disbursementService.js — missing

Acceptance Criteria

 NGO admin can set fund allocation breakdown per campaign sub-category
 NGO admin can record a disbursement against an allocation
 NGO admin can reallocate funds between sub-categories
 All disbursements are stored with an audit trail
 NGO admin can generate a disbursement report (PDF)

Notes
Frontend does not expose allocation CRUD yet. [?]
Frontend sends rejection_reason for disbursements but no DB column or backend handling exists.

Module 5 — Live Dashboard
What it does
Real-time progress bars, donation stats, and donor activity feed for NGO and donors.

Backend

Routes: GET /dashboard/ngo, GET /dashboard/admin, GET /dashboard/ngo/disbursements
Controller: DashboardController — ngoDashboard [done], adminDashboard [done], ngoDisbursementDashboard [done]
Service: DashboardService — missing

Frontend

Pages: NgoDashboard.jsx, DonorDashboard.jsx, AdminDashboard.jsx, NgoDisbursements.jsx
Components: ui/StatCard.jsx, ui/DonationLedger.jsx, ui/Badge.jsx, charts (Chart.js)
Hook: useDashboard — missing
Service: dashboardService.js — missing

Acceptance Criteria

 NGO admin sees total funds raised, active campaigns, recent donations
 Donor sees their total donations and campaign progress they contributed to
 Admin sees platform-wide stats (total users, total raised, active campaigns)
 Progress bars update to reflect latest donation totals

Notes
NgoDashboard includes a hardcoded Total Donors value. [?]

Module 6 — AI Chatbot (FAQ)
What it does
Embedded widget (Dialogflow) to handle common donor queries automatically.

Backend

Routes: POST /chatbot/webhook
Controller: ChatbotController — handleWebhook [done]
Integration: Dialogflow webhook — exists (server endpoint only)

Frontend

Pages: N/A
Components: Chatbot widget — missing
Hook: useChatbot — missing
Service: chatbotService.js — missing

Acceptance Criteria

 Chatbot widget is visible to donors on campaign pages
 Chatbot responds to predefined FAQ topics
 Unanswered queries are handled gracefully with fallback message

Notes
Frontend widget is not implemented yet.

Module 7 — Notifications
What it does
Push/email alerts for campaign milestones and donation confirmations (Firebase Cloud Messaging).

Backend

Routes: GET /notifications, PATCH /notifications/{id}/read, PATCH /notifications/read-all
Controller: NotificationController — index [done], markAsRead [done], markAllAsRead [done]
Notification classes: CampaignApprovedNotification.php
Current implementation: Laravel database notifications

Frontend

Pages: N/A
Components: notification bell/dropdown — missing
Hook: useNotifications — missing
Service: notificationService.js — missing

Acceptance Criteria

 Donor receives notification on successful donation
 NGO admin receives notification when a donation is made to their campaign
 Admin receives notification when a new NGO registers
 User can mark notifications as read
 Notification count badge updates in navbar

Notes
Firebase Cloud Messaging: deferred — see architecture.md
