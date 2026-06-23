## Database & Migrations
- 2014_10_12_000000_create_users_table.php: creates users (role enum admin/ngo/donor)
- 2014_10_12_100000_create_password_reset_tokens_table.php: creates password_reset_tokens (email primary key)
- 2019_08_19_000000_create_failed_jobs_table.php: creates failed_jobs
- 2019_12_14_000001_create_personal_access_tokens_table.php: creates personal_access_tokens (polymorphic tokenable)
- 2026_04_13_073401_create_campaigns_table.php: creates campaigns, FK user_id -> users.id (cascade)
- 2026_04_13_073401_create_campaigns_table.php: creates campaigns, FK user_id -> users.id (cascade)
- 2026_06_09_000000_add_start_end_dates_to_campaigns_table.php: adds nullable `start_date` and `end_date` to campaigns
- 2026_04_13_073411_create_donations_table.php: creates donations, FK user_id -> users.id (null on delete), FK campaign_id -> campaigns.id (cascade)
- 2026_04_13_073422_create_allocations_table.php: creates allocations, FK campaign_id -> campaigns.id (cascade)
- 2026_04_16_145313_create_disbursements_table.php: creates disbursements, FK campaign_id -> campaigns.id (cascade)
- 2026_04_17_032417_create_settings_table.php: creates settings
- 2026_04_17_033254_add_allocation_id_to_donations_table.php: adds FK allocation_id -> allocations.id (null on delete)
- 2026_04_17_065549_create_notifications_table.php: creates notifications (polymorphic notifiable)
- 2026_04_23_120000_add_rejection_reason_to_disbursements_table.php: adds nullable rejection_reason to disbursements
- 2026_06_18_100815_add_org_details_to_users_table.php: adds nullable org_name, org_reg_number, org_description to users table
- 2026_06_18_200000_add_status_to_users_table.php: adds status column (default active) to users table
- 2026_06_22_103710_add_document_paths_to_users_table.php: adds permit_path and tax_certificate_path to store uploaded NGO verification documents
- 2026_06_22_155500_add_image_paths_to_campaigns_table.php: adds image_paths JSON column to store up to 5 campaign image links
- EnsureUserIsActive.php: request-interception middleware to enforce status-based account suspension

## Models
- User: hasMany Campaign, Donation added; org_name, org_reg_number, org_description, permit_path, tax_certificate_path fillable fields added
- Campaign: belongsTo User; hasMany Allocation, Disbursement, Donation; image_paths casted as array for slideshows
- Notification Database Classes:
	- CampaignApprovedNotification: NGO campaign approval alert
	- CampaignGoalReachedNotification: NGO fundraising goal hit alert
	- DonationReceivedNotification: NGO donation incoming alert
	- DonationSuccessNotification: Donor transaction success alert
	- NewNgoRegisteredNotification: Admin new NGO verification alert
	- NewCampaignSubmittedNotification: Admin new campaign moderation alert
	- NewDisbursementRequestNotification: Admin new payout request alert
	- DisbursementDecidedNotification: NGO payout decision alert

## Controllers
- AdminUserController: index [done], destroy [done], store [done] (service-backed user creation), updateStatus [done] (suspend/activate user)
- AllocationController: store [done], update [done] (service-backed; rejects attempts to update allocation amounts after creation)
- AuthController: register [done], login [done], logout [done], user [done] (service-backed, public registration restricted to donor/ngo and validates NGO details)
- CampaignController: index [done], store [done], show [done], showNgo [done], update [done] (service-backed; supports updating default image or up to 5 custom campaign images), destroy [done] (admin support), donate [done] (service-backed, NGO status toggle support, start/end dates support, blocks suspended organizers)
- ChatbotController: handleWebhook [done]
- Controller: no custom methods
- DashboardController: ngoDashboard [done], adminDashboard [done], ngoDisbursementDashboard [done] (service-backed)
- DisbursementController: store [done], indexAdmin [done], updateStatus [done] (service-backed, rejection_reason handled)
- DonationController: store [done], index [done], receipt download [done] (service-backed)
- NotificationController: index [done], markAsRead [done], markAllAsRead [done]
- ProfileController: update [done] (service-backed)
- ReportController: allocationReport [done], disbursementReport [done]
- SettingController: index [done], store [done]
- StripeController: connect [done], verifyOnboarding [done], handleWebhook [done] (Stripe Connect Express and PaymentIntents processing)

## Routes (api.php)
- Auth: POST /register, POST /login, POST /logout, GET /user, PATCH /profile
- Campaigns: GET /campaigns, GET /campaigns/{id}, POST /campaigns, PUT /campaigns/{id}, PATCH /campaigns/{id}, DELETE /campaigns/{id}, GET /ngo/campaigns/{id}
- Donations: POST /campaigns/{id}/donate, POST /donations, GET /donations, GET /donations/{id}/receipt
- Allocations: POST /campaigns/{campaign_id}/allocations, PATCH /campaigns/{campaign_id}/allocations/{id}
- Disbursements: POST /campaigns/{campaign_id}/disbursements, GET /admin/disbursements, PATCH /admin/disbursements/{id}/status
- Dashboards: GET /dashboard/ngo, GET /dashboard/admin, GET /dashboard/ngo/disbursements
- Admin Users: GET /admin/users, POST /admin/users, PATCH /admin/users/{id}/status, DELETE /admin/users/{id}
- Settings: GET /admin/settings, POST /admin/settings
- Reports: GET /campaigns/{campaign_id}/reports/allocations, GET /campaigns/{campaign_id}/reports/disbursements
- Notifications: GET /notifications, PATCH /notifications/{id}/read, PATCH /notifications/read-all
- Chatbot: POST /chatbot/webhook
- Stripe: GET /stripe/connect, POST /stripe/verify-onboarding, POST /webhooks/stripe, POST /webhooks/stripe/connect

## Frontend Pages
- Home.jsx: public campaign gallery, hero layout, geometric/glow visuals, trust metrics grid, and professional copyright footer [done]
- Login.jsx: login form and role-based redirect [done]
- Register.jsx: public donor and NGO registration form, with automated validation error scrolling and NGO document upload [done]
- CampaignDetails.jsx: campaign details with donation flow, sub-goal donut progress, equal-split labeling, and interactive image slideshow carousel (navigation arrows, position dots, count badge) [done]
- CreateCampaign.jsx: NGO campaign creation form supporting up to 5 image uploads and "Use Default Image" testing helper [done]
- UserProfile.jsx: user profile settings page showing active account status badges (Active/Suspended, Verified NGO / Pending Verification, Tax Exempt) and document download links, plus "Back to Dashboard" navigation link for donors [done]
- NgoCampaigns.jsx: NGO campaigns list with status controls, payout modal (fixed typing freeze bug), and view action [done]
- NgoCampaignDetails.jsx: NGO campaign details with donations, allocations, disbursements, campaign/allocations editing, interactive image slideshow carousel with Pencil edit icon, restricted allocation amount editing, and Withdrawn metrics in Funding Progress [done]
- DonorDashboard.jsx: donor impact stats, donation history, receipt download action [done]
- NgoDashboard.jsx: NGO overview metrics and charts, updated to use RM currency and full-row width layout [done]
- NgoDisbursements.jsx: NGO disbursement dashboard and request modal [done]
- AdminDashboard.jsx: admin campaign moderation table [done]
- AdminDisbursements.jsx: admin disbursement moderation table [done]
- StripeCallback.jsx: NGO onboarding redirect verification handler [done]

## Frontend Components
- ProtectedRoute.jsx: role-based route guard
- layout/DashboardLayout.jsx: sidebar dashboard shell
- layout/Navbar.jsx: top navigation bar redesigned with sticky backdrop-blur, custom profile capsules, and dynamic "My Impact" label for donors [done]
- ui/Avatar.jsx: initials avatar
- ui/Badge.jsx: status badge (includes completed styling)
- ui/Button.jsx: styled button
- ui/Card.jsx: card container
- ui/CampaignCard.jsx: campaign summary card, with cover images removed and NGO verification/tax status badges placed next to the organizer's name [done]
- ui/ChatbotWidget.jsx: interactive AI chatbot widget for FAQs and active campaigns queries
- ui/CheckoutModal.jsx: Stripe Elements payment validation & LHDN tax exemption details modal [done]
- ui/DonationLedger.jsx: donation ledger table
- ui/Input.jsx: styled input
- ui/Modal.jsx: generic modal
- ui/NgoProfileView.jsx: NGO profile detail viewer updated with status, verification, and tax exempt badges [done]
- ui/NotificationDropdown.jsx: bell trigger with unread badge, relative times, click-outside auto close, and optimistic card clear actions [done]
- ui/StatCard.jsx: metric card
- ui/Textarea.jsx: styled textarea

## Services & Hooks
- Laravel services:
	- AuthService
	- ProfileService
	- CampaignService (create now accepts start/end dates; update forbids changing dates for NGOs)
	- DonationService (receipt PDF generation)
	- AllocationService
	- DisbursementService
	- DashboardService
- React services:
	- authService
	- campaignService
	- chatbotService
	- donationService (receipt download)
	- allocationService
	- disbursementService
	- dashboardService
	- notificationService
- React hooks:
	- useAuthForm
	- useRegisterForm
	- useCreateCampaign
	- useDonationFlow (client-side blocks donations outside campaign window)
	- useDonationReceipt
	- useNgoCampaigns
	- useNgoCampaignDetails
	- useNgoDisbursements
	- useNgoDashboardData
	- useChatbot
	- useNotifications
	- useAuth (existing in AuthContext.jsx)

## Missing — Not Started Yet
- L1 Disbursement Approval Assistant with Quotation-Receipt Reconciliation
- L2 NGO Verification Pre-Check
- L3 Quotation-to-Allocation Generator

## Inconsistencies Found
- Previously found inconsistencies above have been resolved during service-layer refactor and frontend wiring.
