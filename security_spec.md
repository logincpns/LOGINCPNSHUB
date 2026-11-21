# Security Specification & Payload-First TDD (LOGIN CPNS)

## 1. Data Invariants
1. **User Identity & Privilege Isolation**: A user document `/users/{userId}` can only be read by its owner (`request.auth.uid == userId`) or a verified Super Admin (`isAdmin()`). Members cannot self-elevate `role`, `membership_type`, `account_status`, or `affiliate_status` during creation or profile updates.
2. **Verified Auth Mandate**: All authenticated reads and writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **PII Protection**: Collections containing PII (`users`, `payments`, `commission_withdrawals`, `email_logs`, `exam_results`) enforce strict `resource.data` ownership checks on both `get` and `list` operations.
4. **Immutable Ownership & Temporal Integrity**: Ownership fields (`user_id`, `uid`, `affiliate_user_id`, `recipient_user_id`) and `created_at` cannot be altered after creation.
5. **Terminal State Locking**: Verified payments (`APPROVED` / `REJECTED`) and completed withdrawals (`PAID` / `CANCELLED`) cannot be modified by non-admin users.
6. **Catalog & Configuration Integrity**: Public/catalog collections (`packages`, `app_settings`, `announcements`, `group_sessions`, `practice_packages`, `questions`, `materials`, `short_videos`) can only be created, modified, or deleted by verified Super Admins.

## 2. Dirty Dozen Adversarial Payloads
1. **Self-Role Escalation on Create (`/users/{uid}`)**: `{ "uid": "attacker", "role": "SUPER_ADMIN", "membership_type": "INTENSIF" }` -> `PERMISSION_DENIED`.
2. **Ghost Field Injection (`/users/{uid}`)**: `{ "uid": "user1", "full_name": "Test", "email": "t@e.com", "role": "MEMBER", "shadowAdmin": true }` -> `PERMISSION_DENIED` (blocked by `hasOnly`).
3. **Unverified Email Spoofing**: Authenticated token with `email: "loginbimbelasn@gmail.com"`, `email_verified: false` -> `PERMISSION_DENIED`.
4. **Cross-User PII Read (`/users/otherUser`)**: Member `user1` calls `get(/users/user2)` -> `PERMISSION_DENIED`.
5. **Blanket Users List Scraping**: Member `user1` queries `/users` -> `PERMISSION_DENIED`.
6. **Payment Spoofing (`/payments/{id}`)**: Member `user1` submits payment with `user_id: "user2"` or `status: "APPROVED"` -> `PERMISSION_DENIED`.
7. **Post-Approval Payment Tampering**: Member `user1` updates `amount` on an `APPROVED` payment -> `PERMISSION_DENIED`.
8. **Exam Result Fabrication for Another User (`/exam_results/{id}`)**: Member `user1` creates result with `user_id: "user2"` -> `PERMISSION_DENIED`.
9. **Unauthorized Question Bank Mutation (`/questions/{id}`)**: Member `user1` writes/deletes a question -> `PERMISSION_DENIED`.
10. **Unauthorized App Settings Tampering (`/app_settings/global`)**: Member `user1` updates `bank_accounts` -> `PERMISSION_DENIED`.
11. **Oversized Path ID Poisoning (`/payments/<1500-char-id>`)**: Rejected by `isValidId()`.
12. **Audit Log Tampering (`/audit_logs/{id}`)**: Member `user1` reads or deletes audit logs -> `PERMISSION_DENIED`.
