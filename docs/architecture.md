# Architecture

Last updated: 2026-04-23

---

## Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Backend | Laravel | ^10.10 | REST API only — no Blade views |
| Frontend | React.js + Vite | ^19.2.4 + ^8.0.4 | SPA, communicates via API |
| Database | MySQL | — | Eloquent ORM, no raw queries |
| Auth | Laravel Sanctum | — | Bearer token, role-based |
| PDF | barryvdh/laravel-dompdf | — | Receipt generation |
| LLM | Google AI Studio (Gemini API) | — | Phase 2 only — not yet integrated |
| Chatbot | Dialogflow | — | Integrated AI assistant for common queries |
| Notifications | Laravel Database Notifications | — | FCM (Firebase) to be integrated in a later phase |
| Payment Gateway | Stripe (`stripe/stripe-php`) | — | Express Connect / Platform Escrow Model |

---

## Roles

| Role Key | Description |
|---|---|
| `admin` | System administrator — manages users, roles, system settings |
| `ngo` | NGO administrator — manages campaigns, allocations, disbursements |
| `donor` | Public donor — browses campaigns, donates, views history |

> ⚠️ Earlier planning docs used `system_admin` / `ngo_admin` / `donor`.
> The actual codebase uses `admin` / `ngo` / `donor`. Treat the codebase as source of truth.

---

## Backend Folder Structure (Laravel)

```
app/
├── Console/                    # Artisan commands and scheduled task kernel
├── Exceptions/                 # Centralized exception handler
├── Http/
│   ├── Controllers/            # Thin controllers — handle HTTP in/out only
│   │   ├── AuthController          # register, login, logout (Sanctum)
│   │   ├── CampaignController      # CRUD for donation campaigns
│   │   ├── DonationController      # Donation submission and history
│   │   ├── DisbursementController  # Disbursement requests and approval
│   │   ├── AllocationController    # Fund allocation per campaign
│   │   ├── DashboardController     # Aggregated stats for dashboards
│   │   ├── ReportController        # Report generation (PDF via DomPDF)
│   │   ├── SettingsController      # System settings management
│   │   ├── NotificationController  # Notification retrieval and marking read
│   │   └── ChatbotController       # Chatbot webhook handler
│   └── Middleware/             # Auth redirects, CORS, CSRF, proxy trust
├── Models/
│   ├── User.php                # Role enum, relationships to campaigns/donations
│   ├── Campaign.php            # Belongs to ngo user, has many donations/allocations
│   ├── Donation.php            # Belongs to donor and campaign
│   ├── Allocation.php          # Fund allocation per campaign sub-category
│   ├── Disbursement.php        # Fund disbursement records per campaign
│   └── Setting.php             # Key-value system settings
├── Notifications/
│   └── CampaignApprovalNotification   # Laravel DB notification class
├── Providers/                  # AppServiceProvider, RouteServiceProvider etc.
├── Services/                   # ⏳ To be populated as each module is completed
│                               #    Business logic extracted from controllers goes here
│                               #    Example: CampaignService, DonationService, DisbursementService

database/
├── migrations/                 # One file per table — schema source of truth
└── seeders/                    # Test/demo data seeders

routes/
├── api.php                     # All API routes (base URL: /api/)
└── web.php                     # Minimal — SPA fallback only
```

---

## Frontend Folder Structure (React)

```
src/
├── main.jsx                    # App entry point, mounts React to DOM
├── App.jsx                     # Top-level router, protected route definitions
├── App.css                     # App-level styles
├── index.css                   # Global styles
├── assets/                     # Static files (images, icons)
├── api/                        # Axios instance + auth token interceptor
├── context/                    # React context providers
│   └── AuthContext             # Session state, current user, role
├── components/
│   ├── layout/                 # Page shells
│   │   ├── Navbar              # Top navigation
│   │   └── DashboardLayout     # Sidebar + content wrapper
│   └── ui/                     # Reusable presentational components
│       └── (cards, inputs, badges, modals, etc.)
├── pages/                      # One folder/file per route
│   ├── Home
│   ├── Login
│   ├── admin/                  # System admin pages
│   ├── ngo/                    # NGO admin pages (campaigns, disbursements)
│   └── donor/                  # Donor pages (browse, donate, history)
├── hooks/                      # ⏳ To be populated as each module is completed
│                               #    Extract stateful logic from pages into hooks here
│                               #    Example: useAuth, useCampaigns, useDonation
└── services/                   # ⏳ To be populated as each module is completed
                                #    All axios API calls go here, never inline in components
                                #    Example: campaignService.js, donationService.js
```

---

## API Design Conventions

- **Base URL:** `/api/`
- **Auth:** Bearer token via Laravel Sanctum — pass in `Authorization: Bearer {token}` header
- **Standard success response:**
  ```json
  {
    "success": true,
    "data": {},
    "message": ""
  }
  ```
- **Standard error response:**
  ```json
  {
    "success": false,
    "message": "Human-readable error",
    "errors": {}
  }
  ```
- All protected routes must use `auth:sanctum` middleware
- Role-gated routes must additionally check role via middleware or policy

---

## Database Conventions

- Column names: `snake_case` always
- Every table has: `id`, `created_at`, `updated_at`
- Soft deletes: not used in this project
- Foreign key naming: `{referenced_table_singular}_id` (e.g. `campaign_id`, `user_id`)
- No raw SQL — Eloquent only unless a query cannot be expressed cleanly in ORM

---

## Clean Architecture Flow

```
# Backend (Laravel)
Incoming Request
  → Route (api.php)
  → Middleware (auth, role check)
  → Controller (validate input, call service, return response)
  → Service (business logic — populated progressively)
  → Model (data access via Eloquent)
  → JSON Response

# Frontend (React)
User Interaction
  → Page component (layout + triggers only)
  → Custom Hook (state, side effects — populated progressively)
  → Service function (axios API call)
  → Laravel API
  → Update state → re-render
```

---

## Infrastructure & Environment

| Component | Platform / Config | Notes |
|---|---|---|
| **Frontend Hosting** | Vercel | Auto-deploy from GitHub `main` branch, handles SPA routing |
| **Backend Hosting** | DigitalOcean | Serves Laravel API and scheduled workers |
| **Database** | MySQL | Hosted on DigitalOcean (Managed Database/Droplet) |
| **Payment Gateway** | Stripe | Webhooks configured on DigitalOcean endpoint |
| **Chatbot NLP** | Dialogflow | Embedded in frontend, requests proxied through backend |
| `APP_ENV` | `local` / `production` | Defined in `.env` |
| PHP | ^8.1 (composer constraint) | |
| Node | Locked via `.nvmrc` ✅ | |

---

## Stripe Sandbox Setup (when Donation Flow module begins)

1. Create a free account at [dashboard.stripe.com](https://dashboard.stripe.com)
2. No approval process — test keys are available immediately after signup
3. Copy `STRIPE_KEY` (publishable) and `STRIPE_SECRET` (secret) into `.env`
4. Install package: `composer require stripe/stripe-php`
5. Use Stripe's built-in test card `4242 4242 4242 4242` for all demo transactions
6. All test transactions appear in the Stripe dashboard under **Test mode**

> Do not implement Stripe until the Donation Flow module is reached in `plan.md`.

---

## Technical Decisions Status

| Decision | Status | Notes |
|---|---|---|
| Firebase Cloud Messaging | ⏳ Deferred | Implement after core modules are complete |
| Services layer (Laravel) | ✅ Resolved | app/Services layer is fully implemented and active across all modules |
| hooks/ + services/ (React) | ✅ Resolved | hooks/ and services/ folders are fully implemented and active across all modules |