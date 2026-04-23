# LLM-Powered Modules

> Provider: Google AI Studio (Gemini API)
> Phase: 2 — built after all core modules in core-modules.md are [x] Done
> Last updated: 2026-04-23

## Guiding Rule
All LLM outputs in this system are **advisory only**.
No data is persisted until a human reviews and confirms the LLM result.
This applies to every module below without exception.

## Shared Infrastructure (built once, used by all LLM modules)

| Component | Location | Status |
|---|---|---|
| Gemini API client | `app/Services/GeminiService.php` | [ ] Not started |
| OCR extraction helper | `app/Services/OcrService.php` | [ ] Not started |
| LLM result storage | `disbursement_reconciliations` table | [ ] Not started |

> These are prerequisites. Build GeminiService and OcrService first
> before implementing any individual LLM module.

---

## L1 — Disbursement Reconciliation

### What it does
NGO Admin uploads a quotation PDF and a receipt PDF.
OCR extracts line items from both documents.
Gemini compares them and produces a reconciliation report flagging
discrepancies (price overrun, unplanned items, quantity mismatch, vendor mismatch).
If discrepancies exist, Gemini generates a plain-language explanation.
NGO Admin reviews the report and confirms or corrects before disbursement is saved.

### Status
| Component | Status |
|---|---|
| Backend route | [ ] |
| DisbursementController (upload + reconcile methods) | [ ] |
| DisbursementService (orchestration logic) | [ ] |
| GeminiService (comparison prompt) | [ ] |
| OcrService (PDF extraction) | [ ] |
| disbursement_reconciliations migration | [ ] |
| Frontend upload form | [ ] |
| Frontend reconciliation report view | [ ] |
| Frontend confirmation step | [ ] |

### Flow
```
NGO Admin uploads quotation PDF(s) + receipt PDF(s)
	→ OcrService extracts line items from both
	→ DisbursementService sends structured text to GeminiService
	→ Gemini returns: matched items / flagged items / total variance / explanation
	→ Result stored in disbursement_reconciliations (status: pending_review)
	→ Frontend renders reconciliation table + LLM explanation
	→ NGO Admin reviews → confirms or edits
	→ On confirm: disbursement record saved, reconciliation marked resolved
```

Gemini Output Shape (expected JSON)
```json
{
	"matched": [
		{ "item": "Gloves", "quoted_amount": 50.00, "receipt_amount": 50.00 }
	],
	"flagged": [
		{
			"item": "Bandages",
			"issue": "price_overrun",
			"quoted_amount": 30.00,
			"receipt_amount": 45.00,
			"variance": 15.00,
			"explanation": "Receipt price exceeds quoted price by RM15.00"
		}
	],
	"unplanned": [
		{ "item": "Sanitiser", "receipt_amount": 20.00,
			"explanation": "Item not found in quotation" }
	],
	"total_variance": 35.00,
	"summary": "2 discrepancies found totalling RM35.00. Review before approving."
}
```

Acceptance Criteria

 NGO admin can upload multiple quotation and receipt PDFs per disbursement
 OCR correctly extracts item name, quantity, and amount from PDFs
 Gemini correctly identifies matched, overrun, and unplanned items
 Reconciliation report renders as a clear table in the UI
 LLM explanation is shown in plain language alongside each flagged item
 NGO admin must confirm or justify discrepancies before saving
 Full reconciliation result is stored and viewable in audit log

Notes

pdfplumber for text-based PDFs, Tesseract as OCR fallback for scanned files
OcrService is shared with L3 — build it once


## L2 — NGO Verification Pre-Check
Priority: Low — implement last

### What it does
When a new NGO registers, they upload their ROS (Registrar of Societies)
registration certificate or SSM document.
OCR extracts text from the document.
Gemini checks for expected fields (org name, reg number, registration date, signatory)
and flags anything missing or suspicious.
System Admin sees a structured pre-check report and makes the final approval decision.
No live ROS/SSM API required — Gemini acts as a document sanity checker only.

### Status
| Component | Status |
|---|---|
| Backend route | [ ] |
| NGO registration upload field | [ ] |
| VerificationService | [ ] |
| GeminiService (document check prompt) | [ ] |
| OcrService (reused from L1) | [ ] |
| ngo_verifications migration | [ ] |
| Admin verification review page | [ ] |

### Flow
NGO registers → uploads ROS/SSM certificate (PDF or image)
	→ OcrService extracts document text
	→ VerificationService sends text to GeminiService
	→ Gemini checks for: org name, reg number, date, signatory
	→ Returns: found fields / missing fields / risk flags / summary
	→ Result stored in ngo_verifications table (status: pending_review)
	→ System Admin sees pre-check report on user management page
	→ Admin approves or rejects manually

Acceptance Criteria

 NGO can upload certificate during or after registration
 Gemini correctly identifies present and missing required fields
 Admin sees a structured pre-check summary, not raw OCR text
 Admin makes the final approve/reject decision — LLM cannot auto-approve
 Verification result is stored with the NGO's account record

Notes

No ROS/SSM API integration — document sanity check only
If document is image-based (photo of cert), Tesseract OCR handles it


## L3 — Quotation-to-Allocation Generator

### What it does
NGO Admin uploads one or more quotation PDFs when setting up fund allocation
for a campaign. OCR extracts line items, vendor names, and amounts.
Gemini maps extracted items to campaign sub-categories and generates
a draft allocation breakdown. NGO Admin reviews, edits, and confirms —
nothing is saved until the admin approves the draft.

### Status
| Component | Status |
|---|---|
| Backend route | [ ] |
| AllocationController (upload + generate methods) | [ ] |
| AllocationService (orchestration) | [ ] |
| GeminiService (mapping prompt) | [ ] |
| OcrService (reused from L1) | [ ] |
| Frontend upload step in allocation flow | [ ] |
| Frontend draft allocation review form | [ ] |

### Flow
NGO Admin uploads quotation PDF(s) during allocation setup
	→ OcrService extracts all line items across pages/files
	→ AllocationService sends consolidated text to GeminiService
	→ Gemini maps items to sub-categories, returns draft allocation JSON
	→ Frontend renders pre-filled editable allocation form
	→ NGO Admin reviews, adjusts amounts, confirms
	→ On confirm: allocation records saved to DB

Gemini Output Shape (expected JSON)
```json
{
	"allocations": [
		{ "sub_category": "Medical Supplies", "items": ["Gloves", "Bandages"],
			"total_amount": 80.00 },
		{ "sub_category": "Equipment", "items": ["Stretcher"],
			"total_amount": 200.00 }
	],
	"unclassified": [
		{ "item": "Miscellaneous fee", "amount": 15.00,
			"note": "Could not determine sub-category" }
	],
	"total": 295.00
}
```

Acceptance Criteria

 NGO admin can upload multiple quotation PDFs in the allocation setup flow
 OCR correctly extracts items and amounts across multi-page files
 Gemini correctly maps items to the campaign's defined sub-categories
 Unclassified items are surfaced for manual categorisation
 Draft allocation form is fully editable before confirming
 Nothing is saved to DB until NGO Admin explicitly confirms

Notes

OcrService is shared with L1 — do not duplicate
GeminiService prompt for this module differs from L1 — separate prompt method
e.g. GeminiService::reconcile() for L1, GeminiService::mapToAllocation() for L3
