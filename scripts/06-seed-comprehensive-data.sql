-- Comprehensive seed data for poultry farm management system
-- This script creates realistic data for all tables

-- Clear existing data (optional - comment out if you want to keep existing data)
TRUNCATE TABLE sales, expenses, income, production, animals, employees, vendors CASCADE;

-- Insert Vendors
INSERT INTO vendors (id, user_id, name, vendor_type, contact_person, email, phone, address, notes, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'FeedMaster Supplies', 'feed_supplier', 'John Smith', 'john@feedmaster.com', '+1-555-0101', '123 Farm Road, Iowa', 'Primary feed supplier, 10% bulk discount', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'VetCare Clinic', 'veterinary', 'Dr. Sarah Johnson', 'sarah@vetcare.com', '+1-555-0102', '456 Medical Ave, Iowa', 'Emergency services available 24/7', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'PoultryMart Wholesale', 'buyer', 'Mike Chen', 'mike@poultrymart.com', '+1-555-0103', '789 Commerce St, Chicago', 'Weekly bulk purchases, payment net-30', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'Farm Equipment Co', 'equipment', 'Lisa Brown', 'lisa@farmequip.com', '+1-555-0104', '321 Industrial Blvd, Iowa', 'Maintenance contracts available', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'BioHealth Pharmaceuticals', 'pharmaceutical', 'Dr. Robert Lee', 'robert@biohealth.com', '+1-555-0105', '654 Science Park, Boston', 'Vaccines and medications supplier', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'Local Farmers Market', 'buyer', 'Emma Wilson', 'emma@farmersmarket.com', '+1-555-0106', '987 Market Square, Iowa', 'Retail sales, premium prices', NOW(), NOW());

-- Insert Employees
INSERT INTO employees (id, user_id, name, position, email, phone, hire_date, salary, status, notes, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'James Anderson', 'Farm Manager', 'james@farm.com', '+1-555-0201', '2022-01-15', 55000, 'active', 'Experienced in poultry management, 10 years experience', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'Maria Garcia', 'Veterinary Technician', 'maria@farm.com', '+1-555-0202', '2022-03-20', 45000, 'active', 'Licensed vet tech, handles all health checks', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'David Kim', 'Production Supervisor', 'david@farm.com', '+1-555-0203', '2022-06-01', 42000, 'active', 'Oversees daily egg collection and quality control', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'Jennifer Taylor', 'Feed Specialist', 'jennifer@farm.com', '+1-555-0204', '2023-01-10', 38000, 'active', 'Manages feed inventory and nutrition programs', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'Carlos Rodriguez', 'Maintenance Worker', 'carlos@farm.com', '+1-555-0205', '2023-04-15', 35000, 'active', 'Handles facility maintenance and repairs', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), 'Amy Chen', 'Sales Coordinator', 'amy@farm.com', '+1-555-0206', '2023-08-01', 40000, 'active', 'Manages customer relationships and orders', NOW(), NOW());

-- Insert Animals (Chickens)
INSERT INTO animals (id, user_id, animal_type, breed, tag_number, age_months, gender, weight_kg, health_status, date_acquired, purchase_price, vendor_id, location, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'chicken',
  CASE (random() * 3)::int
    WHEN 0 THEN 'Rhode Island Red'
    WHEN 1 THEN 'Leghorn'
    WHEN 2 THEN 'Plymouth Rock'
    ELSE 'Sussex'
  END,
  'CHK-' || LPAD(generate_series::text, 4, '0'),
  (random() * 24 + 6)::int, -- Age between 6-30 months
  CASE WHEN random() < 0.9 THEN 'female' ELSE 'male' END,
  (random() * 1.5 + 1.5)::numeric(10,2), -- Weight between 1.5-3kg
  CASE (random() * 10)::int
    WHEN 0 THEN 'sick'
    WHEN 1 THEN 'quarantine'
    ELSE 'healthy'
  END,
  CURRENT_DATE - (random() * 365)::int,
  (random() * 10 + 15)::numeric(10,2), -- Price between $15-25
  (SELECT id FROM vendors WHERE vendor_type = 'feed_supplier' LIMIT 1),
  CASE (random() * 3)::int
    WHEN 0 THEN 'Barn A'
    WHEN 1 THEN 'Barn B'
    ELSE 'Barn C'
  END,
  'Regular health monitoring',
  NOW(),
  NOW()
FROM generate_series(1, 500);

-- Insert Production Records (Last 90 days)
INSERT INTO production (id, user_id, product_type, production_date, quantity, unit, quality_grade, batch_number, location, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'eggs',
  CURRENT_DATE - day,
  (random() * 200 + 300)::numeric(10,2), -- 300-500 eggs per day
  'dozen',
  CASE (random() * 3)::int
    WHEN 0 THEN 'Grade AA'
    WHEN 1 THEN 'Grade A'
    ELSE 'Grade B'
  END,
  'BATCH-' || TO_CHAR(CURRENT_DATE - day, 'YYYYMMDD'),
  CASE (random() * 3)::int
    WHEN 0 THEN 'Barn A'
    WHEN 1 THEN 'Barn B'
    ELSE 'Barn C'
  END,
  'Daily production',
  NOW(),
  NOW()
FROM generate_series(0, 89) AS day;

-- Insert Sales Records (Last 90 days)
INSERT INTO sales (id, user_id, product_type, sale_date, quantity, unit_price, total_amount, customer_name, customer_email, customer_phone, payment_method, payment_status, invoice_number, vendor_id, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  CASE (random() * 2)::int
    WHEN 0 THEN 'Eggs - Grade AA'
    ELSE 'Eggs - Grade A'
  END,
  CURRENT_DATE - (random() * 90)::int,
  (random() * 50 + 20)::numeric(10,2), -- 20-70 dozen
  (random() * 2 + 4)::numeric(10,2), -- $4-6 per dozen
  0, -- Will be calculated
  CASE (random() * 5)::int
    WHEN 0 THEN 'Restaurant Deluxe'
    WHEN 1 THEN 'Grocery Plus'
    WHEN 2 THEN 'Bakery Supreme'
    WHEN 3 THEN 'Hotel Grand'
    ELSE 'Cafe Corner'
  END,
  'customer' || (random() * 100)::int || '@email.com',
  '+1-555-' || LPAD((random() * 9999)::int::text, 4, '0'),
  CASE (random() * 3)::int
    WHEN 0 THEN 'cash'
    WHEN 1 THEN 'credit_card'
    ELSE 'bank_transfer'
  END,
  CASE (random() * 10)::int
    WHEN 0 THEN 'pending'
    ELSE 'paid'
  END,
  'INV-' || LPAD((random() * 99999)::int::text, 5, '0'),
  (SELECT id FROM vendors WHERE vendor_type = 'buyer' LIMIT 1),
  'Regular customer',
  NOW(),
  NOW()
FROM generate_series(1, 150);

-- Update total_amount for sales
UPDATE sales SET total_amount = quantity * unit_price;

-- Insert Expenses (Last 90 days)
INSERT INTO expenses (id, user_id, category, expense_date, amount, vendor_name, vendor_id, payment_method, description, receipt_number, is_recurring, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  CASE (random() * 6)::int
    WHEN 0 THEN 'feed'
    WHEN 1 THEN 'veterinary'
    WHEN 2 THEN 'utilities'
    WHEN 3 THEN 'maintenance'
    WHEN 4 THEN 'labor'
    ELSE 'supplies'
  END,
  CURRENT_DATE - (random() * 90)::int,
  (random() * 2000 + 500)::numeric(10,2), -- $500-2500
  CASE (random() * 3)::int
    WHEN 0 THEN 'FeedMaster Supplies'
    WHEN 1 THEN 'VetCare Clinic'
    ELSE 'Farm Equipment Co'
  END,
  (SELECT id FROM vendors ORDER BY random() LIMIT 1),
  CASE (random() * 3)::int
    WHEN 0 THEN 'cash'
    WHEN 1 THEN 'credit_card'
    ELSE 'bank_transfer'
  END,
  CASE (random() * 6)::int
    WHEN 0 THEN 'Monthly feed purchase - premium layer feed'
    WHEN 1 THEN 'Veterinary checkup and vaccinations'
    WHEN 2 THEN 'Electricity and water bills'
    WHEN 3 THEN 'Equipment maintenance and repairs'
    WHEN 4 THEN 'Staff salaries and benefits'
    ELSE 'General farm supplies and materials'
  END,
  'RCP-' || LPAD((random() * 99999)::int::text, 5, '0'),
  CASE (random() * 5)::int
    WHEN 0 THEN true
    ELSE false
  END,
  'Regular expense',
  NOW(),
  NOW()
FROM generate_series(1, 120);

-- Insert Income Records (Last 90 days)
INSERT INTO income (id, user_id, source, income_date, amount, payment_method, customer_name, description, reference_number, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  CASE (random() * 3)::int
    WHEN 0 THEN 'egg_sales'
    WHEN 1 THEN 'meat_sales'
    ELSE 'other'
  END,
  CURRENT_DATE - (random() * 90)::int,
  (random() * 3000 + 1000)::numeric(10,2), -- $1000-4000
  CASE (random() * 3)::int
    WHEN 0 THEN 'cash'
    WHEN 1 THEN 'credit_card'
    ELSE 'bank_transfer'
  END,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Restaurant Deluxe'
    WHEN 1 THEN 'Grocery Plus'
    WHEN 2 THEN 'Bakery Supreme'
    WHEN 3 THEN 'Hotel Grand'
    ELSE 'Cafe Corner'
  END,
  'Payment for egg delivery',
  'REF-' || LPAD((random() * 99999)::int::text, 5, '0'),
  'Regular income',
  NOW(),
  NOW()
FROM generate_series(1, 100);

-- Verify data insertion
SELECT 
  'vendors' as table_name, COUNT(*) as record_count FROM vendors
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'animals', COUNT(*) FROM animals
UNION ALL
SELECT 'production', COUNT(*) FROM production
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'income', COUNT(*) FROM income;
