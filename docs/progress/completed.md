## Database & Migrations
- 2014_10_12_000000_create_users_table.php: creates users (role enum admin/ngo/donor)
- 2014_10_12_100000_create_password_reset_tokens_table.php: creates password_reset_tokens (email primary key)
- 2019_08_19_000000_create_failed_jobs_table.php: creates failed_jobs
- 2019_12_14_000001_create_personal_access_tokens_table.php: creates personal_access_tokens (polymorphic tokenable)
- 2026_04_13_073401_create_campaigns_table.php: creates campaigns, FK user_id -> users.id (cascade)
- 2026_04_13_073411_create_donations_table.php: creates donations, FK user_id -> users.id (null on delete), FK campaign_id -> campaigns.id (cascade)
- 2026_04_13_073422_create_allocations_table.php: creates allocations, FK campaign_id -> campaigns.id (cascade)
- 2026_04_16_145313_create_disbursements_table.php: creates disbursements, FK campaign_id -> campaigns.id (cascade)
- 2026_04_17_032417_create_settings_table.php: creates settings
- 2026_04_17_033254_add_allocation_id_to_donations_table.php: adds FK allocation_id -> allocations.id (null on delete)
- 2026_04_17_065549_create_notifications_table.php: creates notifications (polymorphic notifiable)

## Models
- User: no relationships defined; missing expected hasMany Campaign, Donation, Notification
- Campaign: belongsTo User; hasMany Allocation, Disbursement, Donation
- Donation: belongsTo User; belongsTo Campaign; belongsTo Allocation
- Allocation: belongsTo Campaign; missing expected hasMany Donation
- Disbursement: belongsTo Campaign
- Setting: no relationships

## Controllers
- AdminUserController: index [done], destroy [done]
- AllocationController: store [done], update [done]
- AuthController: register [done], login [done], logout [done]
- CampaignController: index [done], store [done], show [done], update [done], destroy [done], donate [done]
- ChatbotController: handleWebhook [done]
- Controller: no custom methods
- DashboardController: ngoDashboard [done], adminDashboard [done], ngoDisbursementDashboard [done]
- DisbursementController: store [done], indexAdmin [done], updateStatus [done]
- DonationController: store [done], index [done]
- NotificationController: index [done], markAsRead [done], markAllAsRead [done]
- ProfileController: update [done]
- ReportController: allocationReport [done], disbursementReport [done]
- SettingController: index [done], store [done]

## Routes (api.php)
- Auth: POST /register, POST /login, POST /logout, GET /user, PATCH /profile
- Campaigns: GET /campaigns, GET /campaigns/{id}, POST /campaigns, PUT /campaigns/{id}, PATCH /campaigns/{id}, DELETE /campaigns/{id}
- Donations: POST /campaigns/{id}/donate, POST /donations, GET /donations
- Allocations: POST /campaigns/{campaign_id}/allocations, PATCH /campaigns/{campaign_id}/allocations/{id}
- Disbursements: POST /campaigns/{campaign_id}/disbursements, GET /admin/disbursements, PATCH /admin/disbursements/{id}/status
- Dashboards: GET /dashboard/ngo, GET /dashboard/admin, GET /dashboard/ngo/disbursements
- Admin Users: GET /admin/users, DELETE /admin/users/{id}
- Settings: GET /admin/settings, POST /admin/settings
- Reports: GET /campaigns/{campaign_id}/reports/allocations, GET /campaigns/{campaign_id}/reports/disbursements
- Notifications: GET /notifications, PATCH /notifications/{id}/read, PATCH /notifications/read-all
- Chatbot: POST /chatbot/webhook

## Frontend Pages
- Home.jsx: public campaign gallery and hero layout [done]
- Login.jsx: login form and role-based redirect [done]
- CampaignDetails.jsx: campaign details with donation flow and modals [done]
- CreateCampaign.jsx: NGO campaign creation form [done]
- DonorDashboard.jsx: donor impact stats and donation history [done]
- NgoDashboard.jsx: NGO overview metrics and charts [partial]
- NgoDisbursements.jsx: NGO disbursement dashboard and request modal [done]
- AdminDashboard.jsx: admin campaign moderation table [done]
- AdminDisbursements.jsx: admin disbursement moderation table [done]

## Frontend Components
- ProtectedRoute.jsx: role-based route guard
- layout/DashboardLayout.jsx: sidebar dashboard shell
- layout/Navbar.jsx: top navigation bar
- ui/Avatar.jsx: initials avatar
- ui/Badge.jsx: status badge
- ui/Button.jsx: styled button
- ui/Card.jsx: card container
- ui/CampaignCard.jsx: campaign summary card
- ui/CheckoutModal.jsx: mock payment flow modal
- ui/DonationLedger.jsx: donation ledger table
- ui/Input.jsx: styled input
- ui/Modal.jsx: generic modal
- ui/StatCard.jsx: metric card
- ui/Textarea.jsx: styled textarea

## Services & Hooks
- Laravel services: none found; Services/ folder missing
- React hooks: useAuth (in AuthContext.jsx)

## Missing — Not Started Yet
- L1 Disbursement Approval Assistant with Quotation-Receipt Reconciliation
- L2 NGO Verification Pre-Check
- L3 Quotation-to-Allocation Generator

## Inconsistencies Found
- Campaign model has a stray "1" in the $fillable array (syntax error risk)
- DonationController eager loads allocation field "title" but allocations use "purpose"
- Donations table has donor_name but Donation model fillable does not include it and controllers never set it
- Disbursement rejection_reason is sent by frontend but no DB column or backend handling exists
- ProtectedRoute expects allowedRoles but several routes pass allowedRole (role guard bypass)
- App.jsx defines /admin/dashboard twice
- Home.jsx uses navigate in handleLogout without calling useNavigate()
