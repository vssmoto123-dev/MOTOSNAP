-- Migration script to update existing file URLs for separate deployment compatibility
-- This script updates relative file paths to include the full /uploads/ prefix
-- Run this after updating the FileStorageService to return full URLs

-- Update inventory image URLs
UPDATE inventory
SET image_url = CONCAT('/uploads/', image_url)
WHERE image_url IS NOT NULL
  AND image_url != ''
  AND image_url NOT LIKE '/uploads/%';

-- Update receipt file URLs
UPDATE receipt
SET file_url = CONCAT('/uploads/', file_url)
WHERE file_url IS NOT NULL
  AND file_url != ''
  AND file_url NOT LIKE '/uploads/%';

-- Update invoice receipt file URLs
UPDATE invoice_receipt
SET file_url = CONCAT('/uploads/', file_url)
WHERE file_url IS NOT NULL
  AND file_url != ''
  AND file_url NOT LIKE '/uploads/%';

-- Verify the updates
SELECT COUNT(*) as total_inventory_items FROM inventory WHERE image_url IS NOT NULL AND image_url != '';
SELECT COUNT(*) as inventory_items_updated FROM inventory WHERE image_url LIKE '/uploads/%';
SELECT COUNT(*) as total_receipts FROM receipt WHERE file_url IS NOT NULL AND file_url != '';
SELECT COUNT(*) as receipts_updated FROM receipt WHERE file_url LIKE '/uploads/%';
SELECT COUNT(*) as total_invoice_receipts FROM invoice_receipt WHERE file_url IS NOT NULL AND file_url != '';
SELECT COUNT(*) as invoice_receipts_updated FROM invoice_receipt WHERE file_url LIKE '/uploads/%';

-- Show sample updated records (for verification)
SELECT 'inventory' as table_name, id, image_url as file_url FROM inventory WHERE image_url LIKE '/uploads/%' LIMIT 5;
SELECT 'receipt' as table_name, id, file_url FROM receipt WHERE file_url LIKE '/uploads/%' LIMIT 5;
SELECT 'invoice_receipt' as table_name, id, file_url FROM invoice_receipt WHERE file_url LIKE '/uploads/%' LIMIT 5;