---
name: backend-review-checklist
description: Use when reviewing API or database changes for contracts, auth/authz, validation, integrity, and failure handling.
---

# Backend Review Checklist

Review in this order:

1. Check API or repository scope against the task.
2. Check validation and auth/authz boundaries.
3. Check data-integrity assumptions, visibility/privacy filters, and transactional safety.
4. Check failure handling and degraded-mode behavior.
5. Check tests or verification coverage for the changed contract.
