-- Migration: add 'category' column to portfolios table
-- Run this in your MySQL instance (e.g., via mysql client)

ALTER TABLE portfolios
ADD COLUMN category VARCHAR(100) DEFAULT NULL;

-- Optional: fill existing rows with a default value if needed
-- UPDATE portfolios SET category = '미분류' WHERE category IS NULL;
