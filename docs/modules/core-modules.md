Core Modules
Reference: docs/system-overview.md
Last updated: 2026-06-21

Status Overview
| # | Module | Backend | Frontend | Overall |
|---|---|---|---|---|
| 1 | Auth & Profile | [x] | [x] | [x] |
| 2 | Campaign Management | [x] | [x] | [x] |
| 3 | Donation Flow | [x] | [x] | [x] |
| 4 | Fund Allocation & Disbursement | [x] | [x] | [x] |
| 5 | Live Dashboard | [x] | [x] | [x] |
| 6 | AI Chatbot (FAQ) | [x] | [x] | [x] |
| 7 | Notifications | [x] | [x] | [x] |

Legend: [ ] Not started · [~] In progress · [x] Done · [!] Blocked · [?] Uncertain

Module 1 — Auth & Profile
What it does
Role-based login/register; profile management per role (Donor, NGO, Admin).

Backend
- Routes: POST /register, POST /login, POST /logout, GET /user, PATCH /profile, GET /profiles/donor/{id}, GET /profiles/ngo/{id}
- Controller: AuthController (register, login, logout, user), ProfileController (update, showDonor, showNgo)
- Service: AuthService, ProfileService (PDPA 2010 gating for donor profiles: visible to Admin, and NGO only if donor contributed to their campaign)
- Model: User.php (relationships to Campaign, Donation, etc. defined)

Frontend
- Pages: Login.jsx, Register.jsx, UserProfile.jsx (editable CRUD matching user role: identification number and address for Donor; reg number, address, and tax exemption settings for NGO)
- Components: ProtectedRoute.jsx, Navbar.jsx, ui/NgoProfileView.jsx (lookup modal on click of NGO name)
- Hook: useAuth (AuthContext.jsx), useRegisterForm, useAuthForm
- Service: authService.js (updateProfile, getDonorProfile, getNgoProfile)

Acceptance Criteria
✓ Donor can register with name, email, password
✓ NGO admin can register with organisation details
✓ All roles can log in and receive a Sanctum token
✓ All roles can view and update their profile
✓ Protected routes reject unauthenticated requests with 401
✓ Donor profiles are protected under PDPA (restricted to Admin & organizing NGOs of campaigns they donated to)

Module 2 — Campaign Management
What it does
NGO creates, edits, and closes campaigns with goals and deadlines. Start/end dates set on creation are immutable. Support for uploading a campaign cover image.

Backend
- Routes: GET /campaigns, GET /campaigns/{id}, POST /campaigns, PUT /campaigns/{id}, PATCH /campaigns/{id}, DELETE /campaigns/{id}
- Controller: CampaignController (index, store, show, showNgo, update, destroy)
- Service: CampaignService (handles creation and storage of campaign cover image under public disk)
- Model: Campaign.php (hasMany allocations, disbursements, donations; start_date/end_date casts; image_path fillable)

Frontend
- Pages: Home.jsx, CampaignDetails.jsx, CreateCampaign.jsx (3-step wizard stepper with timelines and allocations, file upload selector for cover image), NgoDashboard.jsx, AdminDashboard.jsx
- Components: ui/CampaignCard.jsx, ui/Card.jsx, ui/Badge.jsx, ui/StatCard.jsx
- Hook: useCreateCampaign
- Service: campaignService.js (supports multipart/form-data for image uploads)

Acceptance Criteria
✓ NGO admin can create a campaign with title, description, goal amount, deadline, and cover image
✓ NGO admin can edit and close a campaign
✓ Admin can approve or reject a campaign
✓ All users can view active campaigns with cover images rendered dynamically
✓ Campaign shows real-time progress bar toward goal

Module 3 — Donation Flow
What it does
Donor browses active campaigns, checks out with a simulated payment gateway, requests a tax exemption receipt (pre-filled from Donor profile) if the NGO is approved, and downloads LHDN Section 44(6) compliant PDF receipts.

Backend
- Routes: POST /campaigns/{id}/donate, POST /donations, GET /donations, GET /donations/{id}/receipt
- Controller: DonationController (store, index, receipt), CampaignController (donate)
- Service: DonationService (receipt generation with sequential LHDN numbers and Ringgit Malaysia words conversion helper)
- Model: Donation.php (belongsTo user, campaign, allocation)
- Helper: NumberToWordsHelper (spells out ringgit and cents numbers into English text)

Frontend
- Pages: Home.jsx, CampaignDetails.jsx, DonorDashboard.jsx (donation ledger with click-blocked asynchronous download indicators)
- Components: ui/CheckoutModal.jsx (LHDN receipt request checkbox and fields pre-filled from Donor context), ui/Modal.jsx
- Hook: useDonationFlow, useDonationReceipt
- Service: donationService.js

Acceptance Criteria
✓ Donor can browse and filter active campaigns
✓ Donor can select a campaign and enter donation amount (blocks donations outside active timelines)
✓ Payment is processed securely via CheckoutModal (Stripe Credit/Debit Card)
✓ Donation record and tax details are saved on successful payment webhook confirmation
✓ Compliant PDF receipts with sequential formatting and words conversion are generated
✓ Donor can download receipt from history ledger with visual download feedback

Module 4 — Fund Allocation & Disbursement
What it does
NGO allocates funds across sub-categories and tracks disbursement requests. Campaign overfunding is dynamically redistributed to underfunded categories using an equal-share redistribution waterfall. Disbursed funds are visually tracked on both NGO and Donor campaign views with dual-color progress bars. Record payout modals allow checkbox checklists selection of campaign allocations (+ "General Surplus") for purpose of funds, and detail text notes. NGO and Admin can generate a campaign summary report.

Backend
- Routes: POST /campaigns/{campaign_id}/allocations, PATCH /campaigns/{campaign_id}/allocations/{id}, POST /campaigns/{campaign_id}/disbursements, GET /admin/disbursements, PATCH /admin/disbursements/{id}/status, GET /campaigns/{campaign_id}/reports/summary
- Controller: AllocationController, DisbursementController (validates details field), ReportController (campaignReport streams summary PDF of donations and disbursements)
- Service: AllocationService, DisbursementService (saves details field)
- Model: Allocation.php (buildAllocationProgress implements equal-share overfunding redistribution waterfall), Disbursement.php (details field fillable)

Frontend
- Pages: NgoDisbursements.jsx (Record Payout checklist & details input), NgoCampaignDetails.jsx (Slideshow image update, locked allocation amount, consolidated metrics, dual-color progress bar), CampaignDetails.jsx (dual-color progress bar, 3-column stats Target/Raised/Fund Used breakdown), Export Campaign Report button downloads PDF summary of allocations and payouts.
- Components: ui/Modal.jsx, ui/Badge.jsx
- Hook: useNgoDisbursements (joins checklist purpose, details field), useNgoCampaignDetails, useNgoCampaigns (joins checklist purpose, details field)
- Service: disbursementService.js, campaignService.js (downloadCampaignReport)

Acceptance Criteria
✓ NGO admin can set fund allocation breakdown per campaign sub-category
✓ NGO admin can record a disbursement against an allocation (with checklist purpose and details notes)
✓ All disbursements are stored with an audit trail (including purpose and details)
✓ Overfunding excess is automatically pooled and redistributed to underfunded sub-categories first, then to General Surplus
✓ Campaign detail pages display clear visual progress bars with dual-color (disbursed vs available) segmentation and clean stats grids
✓ NGO admin/Admin can generate an export campaign report (PDF)

Module 5 — Live Dashboard
What it does
Real-time progress bars, donation statistics, and dynamic feeds for NGO, Donor, and Admin portals.

Backend
- Routes: GET /dashboard/ngo, GET /dashboard/admin, GET /dashboard/ngo/disbursements
- Controller: DashboardController
- Service: DashboardService

Frontend
- Pages: NgoDashboard.jsx (fully interactive HSL chart analytics), DonorDashboard.jsx, AdminDashboard.jsx
- Components: ui/StatCard.jsx, ui/DonationLedger.jsx, ui/Badge.jsx
- Hook: useNgoDashboardData
- Service: dashboardService.js

Module 6 — AI Chatbot (FAQ)
What it does
Embedded chatbot widget routing natural language queries through Dialogflow Messenger.

Backend
- Routes: POST /chatbot/webhook
- Controller: ChatbotController (handles webhook fulfillments to query active campaigns)

Frontend
- Components: ui/ChatbotWidget.jsx (globally integrated via Navbar)
- Hook: useChatbot
- Service: chatbotService.js

Module 7 — Notifications
What it does
Unread count badge, relative timestamps, Deep-linking to action pages, and Optimistic UI clears.

Backend
- Routes: GET /notifications, PATCH /notifications/{id}/read, PATCH /notifications/read-all
- Controller: NotificationController

Frontend
- Components: ui/NotificationDropdown.jsx (Navbar and Dashboard sidebar integrations)
- Hook: useNotifications
- Service: notificationService.js
