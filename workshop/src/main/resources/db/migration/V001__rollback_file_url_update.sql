-- Rollback script for V001__update_file_urls_for_separate_deployment.sql
-- This script removes the /uploads/ prefix from file URLs

-- Rollback inventory image URLs
UPDATE inventory
SET image_url = REPLACE(image_url, '/uploads/', '')
WHERE image_url LIKE '/uploads/%';

-- Rollback receipt file URLs
UPDATE receipt
SET file_url = REPLACE(file_url, '/uploads/', '')
WHERE file_url LIKE '/uploads/%';

-- Rollback invoice receipt file URLs
UPDATE invoice_receipt
SET file_url = REPLACE(file_url, '/uploads/', '')
WHERE file_url LIKE '/uploads/%';

-- Verify the rollback
SELECT COUNT(*) as inventory_items_rolledback FROM inventory WHERE image_url IS NOT NULL AND image_url != '' AND image_url NOT LIKE '/uploads/%';
SELECT COUNT(*) as receipts_rolledback FROM receipt WHERE file_url IS NOT NULL AND file_url != '' AND file_url NOT LIKE '/uploads/%';
SELECT COUNT(*) as invoice_receipts_rolledback FROM invoice_receipt WHERE file_url IS NOT NULL AND file_url != '' AND file_url NOT LIKE '/uploads/%';