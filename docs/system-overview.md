# System Overview — Donation-Based Crowdfunding System


**Stack:** React.js (Frontend on Vercel) · Laravel (Backend API on DigitalOcean) · MySQL (Database) · Dialogflow (Chatbot) · Stripe (Payment Gateway) · Google AI Studio (Gemini API)


A web platform built for St. John Ambulans Malaysia (SJAM KMT) to manage, promote, and track donation campaigns online with transparency and donor engagement at its core.


---


## Roles


| Role | Responsibility |
|---|---|
| **admin** | Manage user accounts, roles, system settings, and NGO verification approvals |
| **ngo** | Create/manage campaigns, upload quotations, allocate funds, view dashboards, generate reports |
| **Donor** | Browse campaigns, donate, track history, receive digital receipts |


---


## Core Modules


1. **Auth & Profile** — Role-based login/register; profile management per role
2. **Campaign Management** — ngo creates, edits, and closes campaigns with goals and deadlines. Campaigns now include immutable `start_date` and `end_date` fields; donations are accepted only when a campaign is `active` and the current time is within the campaign date window. A scheduled command auto-transitions campaign `status` based on these dates.
3. **Donation Flow** — Donor-facing campaign browsing → secure payment gateway → auto-receipt (PDF) via email
4. **Fund Allocation & Disbursement** — ngo allocates/reallocates funds across sub-categories; tracks disbursement with audit trail
5. **Live Dashboard** — Real-time progress bars, donation stats, and donor activity feed for ngo and Donors
6. **AI Chatbot (FAQ)** — Embedded widget (Dialogflow) to handle common donor queries automatically
7. **Notifications** — Push/email alerts for campaign milestones and donation confirmations (Firebase Cloud Messaging)


---


## LLM-Powered Modules *(built after core is complete)*


> All LLM features connect to **Google AI Studio (Gemini API)**. Each module calls the API server-side from Laravel and stores the LLM output in the DB for human review. LLM output is always a draft — a human confirms before any data is persisted.


### L1 · Disbursement Approval Assistant with Quotation-Receipt Reconciliation *(Deferred to Future Scope)*


**Purpose:** Automate financial reconciliation by mapping uploaded quotations against actual receipts, then using LLM to explain any discrepancies before a disbursement is approved.


**Trigger:** ngo submits a disbursement request and uploads both a quotation PDF and a receipt PDF (multi-page or multiple files supported).


**Flow:**
```
Upload quotation PDF(s) + receipt PDF(s)
  → batch OCR (pdfplumber / Tesseract fallback)
  → extract structured line items from both documents
  → Gemini compares quotation vs receipt
  → generate reconciliation report (matched / mismatched / unplanned items)
  → if clean: disbursement proceeds to approval
  → if discrepancies: LLM generates plain-language explanation + suggested action
  → ngo reviews report, justifies or corrects
  → admin / auto-approval based on threshold
  → result stored in audit log
```


**What the LLM flags:**
- Item on receipt not present in quotation (unplanned spend)
- Receipt price exceeds quoted price (cost overrun)
- Quantity mismatch between documents
- Vendor name mismatch or inconsistency
- Missing receipt for a quoted item


**Output:** A structured reconciliation table (matched items, flagged items, total variance) + a plain-language summary rendered inline for the ngo to review and confirm.


---


### L2 · NGO Verification Pre-Check *(Deferred to Future Scope)*
- **Trigger:** New NGO registers and uploads their ROS (Registrar of Societies) registration certificate or SSM document
- **LLM Role:** OCR extracts text from uploaded doc → Gemini checks for expected fields (org name, reg number, registration date, signatory) and flags missing/suspicious info → generates a verification summary for admin
- **Output:** Admin sees a structured pre-check report; makes the final approval decision manually
- **Note:** No live ROS/SSM API integration required — LLM acts as a document sanity checker, human admin is the final gate
- **Flow:** `NGO uploads cert (PDF/image) → OCR extraction → Gemini analysis → pre-check report → admin approves/rejects`


---


### L3 · Budget-to-Allocation Generator
- **Trigger:** NGO uploads one or more budget reference documents (vendor quotation, project proposal, cost sheet, Excel export, program cost estimation sheet, etc. - PDF or image) during campaign allocation setup [Optional].
- **LLM Role:** OCR extracts line items and amounts → Gemini maps items to campaign sub-categories → generates a draft fund allocation breakdown.
- **Output:** Pre-filled editable allocation form for the NGO to review, adjust, and confirm.
- **Optional Nature:** This upload is completely optional. If the NGO has not obtained quotations or cost proposals yet, they can skip uploading and manually input their allocation categories and target amounts.
- **Flow:** `Upload budget PDF(s)/Image(s) [Optional] → batch OCR → Gemini structures into allocation JSON → render pre-filled editable allocation form → NGO manually reviews/edits → NGO confirms/submits`


---


## Key Design Principles


- Transparency-first: every donation is traceable from payment to disbursement
- LLM outputs are always advisory — a human confirms before any data is persisted
- Quotation-receipt reconciliation creates an auditable paper trail for every disbursement
- Receipt auto-generated as PDF on successful donation
- Donor recognition list on campaign pages to encourage social proof
- All sensitive routes protected by role-based middleware

