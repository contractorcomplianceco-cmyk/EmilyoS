---
name: command-center attachment storage
description: Where command-center stores binary file attachments (IndexedDB) vs. the rest of its data (localStorage), and the constraints around each.
---

# command-center attachment storage

command-center has no backend. The whole `Database` (records/metadata) persists as one JSON blob in `localStorage` (`src/lib/store.ts`, key `rccc.data.v1`). **Binary file attachments do NOT live in that blob** — they live in IndexedDB (`src/lib/attachments.ts`, db `rccc.attachments`, store `files`), keyed by `EmployeeDocument.fileRef`.

**Why:** localStorage is ~5 MB per origin and the whole app shares it; base64 inflates files ~33%, so multi-MB attachments alone blew the quota. Moving blobs to IndexedDB lets the per-file cap be large (currently 25 MB via `maxSizeMB` in `fields.ts`).

**How to apply:**
- The `RecordFormDialog` `file` field still produces a data URL into form state; the *page-level* `onSubmit` (EmployeeAccount) is what writes that data URL to IndexedDB via `putAttachment`, stores only `fileRef` on the record, and sets `fileData: undefined` so the binary never reaches localStorage. New file fields elsewhere must do the same — don't persist `fileData` inline.
- Legacy docs with inline `fileData` still download (download checks `fileRef` first, falls back to `fileData`) and auto-migrate to IndexedDB on next edit-save.
- Deleting a document/attachment must also `deleteAttachment(fileRef)` or the IndexedDB blob orphans.
- The storage meter uses `navigator.storage.estimate()` (origin-wide usage/quota, covers IndexedDB+localStorage), not the old fixed 5 MB localStorage budget. It hides itself when `estimate()` is unavailable.
- `saveRecord` is still transactional and throws `StorageError` on localStorage quota; `putAttachment` also throws `StorageError` on IndexedDB write failure. Callers catch and surface it, returning `false` from `onSubmit` to keep the dialog open.
