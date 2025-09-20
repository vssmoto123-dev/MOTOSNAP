-- Migration script to fix file URLs for proper file serving
-- This script removes the /uploads/ prefix from file URLs since FileStorageService now returns only filenames
-- Run this after updating the FileStorageService to return only filenames

-- Remove /uploads/ prefix from receipt file URLs
UPDATE receipt
SET file_url = REPLACE(file_url, '/uploads/', '')
WHERE file_url IS NOT NULL
  AND file_url != ''
  AND file_url LIKE '/uploads/%';

-- Remove /uploads/ prefix from invoice receipt file URLs
UPDATE invoice_receipt
SET file_url = REPLACE(file_url, '/uploads/', '')
WHERE file_url IS NOT NULL
  AND file_url != ''
  AND file_url LIKE '/uploads/%';

-- Note: We don't update inventory image URLs here since they might be absolute URLs or different format

-- Verify the updates
SELECT COUNT(*) as total_receipts FROM receipt WHERE file_url IS NOT NULL AND file_url != '';
SELECT COUNT(*) as receipts_fixed FROM receipt WHERE file_url NOT LIKE '/uploads/%' AND file_url != '';
SELECT COUNT(*) as total_invoice_receipts FROM invoice_receipt WHERE file_url IS NOT NULL AND file_url != '';
SELECT COUNT(*) as invoice_receipts_fixed FROM invoice_receipt WHERE file_url NOT LIKE '/uploads/%' AND file_url != '';

-- Show sample fixed records (for verification)
SELECT 'receipt' as table_name, id, file_url FROM receipt WHERE file_url NOT LIKE '/uploads/%' AND file_url != '' LIMIT 5;
SELECT 'invoice_receipt' as table_name, id, file_url FROM invoice_receipt WHERE file_url NOT LIKE '/uploads/%' AND file_url != '' LIMIT 5;