---
name: localStorage blob persistence
description: How command-center stores binary attachments (file uploads) in its localStorage-only data layer, and the quota constraint that governs it.
---

# Storing file attachments in the localStorage store

command-center has no backend — the whole `Database` is persisted as one JSON blob in `localStorage` (`src/lib/store.ts`). File attachments (e.g. EmployeeDocument) are stored inline as base64 data URLs in that same blob.

**Constraint:** browser localStorage is ~5 MB per origin, and base64 inflates a file by ~33%. The entire app's data shares that one budget, so per-file caps must stay small. Keep attachment limits around 1 MB (set via `maxSizeMB` on a `file` field in `fields.ts`); do not raise to multiple MB.

**Why:** a 4 MB file becomes ~5.3 MB base64 and alone exceeds the quota. A code review rejected a 4 MB cap for this reason.

**How to apply:**
- `saveRecord` is transactional: it snapshots `db`, attempts `persist()`, and on failure rolls back and throws `StorageError`. Callers that write large blobs must catch `StorageError` and surface it (the document form does this and returns `false` from `onSubmit` to keep the dialog open).
- `RecordFormDialog`'s `onSubmit` may return `false` to keep the dialog open (e.g. when a save failed); any other return closes it.
- If attachments ever need to be large (multi-MB) or numerous, move blobs out of localStorage to IndexedDB or object storage — do not just raise the cap.
