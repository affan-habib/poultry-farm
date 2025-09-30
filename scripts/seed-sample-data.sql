-- Seed script to populate all tables with sample data
-- This will help visualize all types of data in the poultry farm app

-- First, let's add some vendors (suppliers and customers)
INSERT INTO vendors (id, user_id, name, vendor_type, contact_person, email, phone, address, notes, created_at, updated_at)
VALUES
  (gen_random_uuid(), auth.uid(), 'Green Valley Feed Supply', 'supplier', 'John Smith', 'john@greenvalley.com', '+1-555-0101', '123 Farm Road, Rural County', 'Main feed supplier', now(), now()),
  (gen_random_uuid(), auth.uid(), 'Healthy Hatchery Inc', 'supplier', 'Sarah Johnson', 'sarah@healthyhatchery.com', '+1-555-0102', '456 Poultry Lane, Farm City', 'Quality chicks supplier', now(), now()),
  (gen_random_uuid(), auth.uid(), 'Farm Equipment Co', 'supplier', 'Mike Brown', 'mike@farmequip.com', '+1-555-0103', '789 Equipment St, Tool Town', 'Equipment and supplies', now(), now()),
  (gen_random_uuid(), auth.uid(), 'City Fresh Market', 'customer', 'Emily Davis', 'emily@cityfresh.com', '+1-555-0201', '321 Market Square, Big City', 'Regular bulk buyer', now(), now()),
  (gen_random_uuid(), auth.uid(), 'Restaurant Group LLC', 'customer', 'David Wilson', 'david@restaurantgroup.com', '+1-555-0202', '654 Dining Ave, Food District', 'High-end restaurant chain', now(), now()),
  (gen_random_uuid(), auth.uid(), 'Local Grocery Chain', 'customer', 'Lisa Anderson', 'lisa@localgrocery.com', '+1-555-0203', '987 Shopping Blvd, Retail City', 'Weekly orders', now(), now());

-- Add employees
INSERT INTO employees (id, user_id, name, position, email, phone, hire_date, salary, status, notes, created_at, updated_at)
VALUES
  (gen_random_uuid(), auth.uid(), 'Carlos Rodriguez', 'Farm Manager', 'carlos@farm.com', '+1-555-1001', '2023-01-15', 45000, 'active', 'Experienced farm manager', now(), now()),
  (gen_random_uuid(), auth.uid(), 'Maria Garcia', 'Animal Caretaker', 'maria@farm.com', '+1-555-1002', '2023-03-20', 32000, 'active', 'Specializes in poultry health', now(), now()),
  (gen_random_uuid(), auth.uid(), 'James Thompson', 'Feed Specialist', 'james@farm.com', '+1-555-1003', '2023-06-10', 35000, 'active', 'Nutrition expert', now(), now()),
  (gen_random_uuid(), auth.uid(), 'Anna Lee', 'Sales Coordinator', 'anna@farm.com', '+1-555-1004', '2023-09-05', 38000, 'active', 'Handles customer relations', now(), now()),
  (gen_random_uuid(), auth.uid(), 'Robert Chen', 'Maintenance Worker', 'robert@farm.com', '+1-555-1005', '2024-01-12', 30000, 'active', 'Facility maintenance', now(), now());

-- Add animals (chickens, ducks, turkeys, etc.)
INSERT INTO animals (id, user_id, animal_type, breed, tag_number, gender, age_months, weight_kg, health_status, location, date_acquired, purchase_price, vendor_id, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  auth.uid(),
  'chicken',
  'Rhode Island Red',
  'CHK-' || LPAD(generate_series::text, 4, '0'),
  CASE WHEN random() < 0.5 THEN 'male' ELSE 'female' END,
  floor(random() * 24 + 3)::integer,
  random() * 2 + 1.5,
  'healthy',
  'Coop A',
  CURRENT_DATE - (random() * 365)::integer,
  random() * 20 + 10,
  (SELECT id FROM vendors WHERE vendor_type = 'supplier' LIMIT 1),
  'Good layer',
  now(),
  now()
FROM generate_series(1, 50);

INSERT INTO animals (id, user_id, animal_type, breed, tag_number, gender, age_months, weight_kg, health_status, location, date_acquired, purchase_price, vendor_id, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  auth.uid(),
  'duck',
  'Pekin',
  'DCK-' || LPAD(generate_series::text, 4, '0'),
  CASE WHEN random() < 0.5 THEN 'male' ELSE 'female' END,
  floor(random() * 18 + 2)::integer,
  random() * 3 + 2,
  CASE WHEN random() < 0.9 THEN 'healthy' ELSE 'under_observation' END,
  'Pond Area',
  CURRENT_DATE - (random() * 300)::integer,
  random() * 25 + 15,
  (SELECT id FROM vendors WHERE vendor_type = 'supplier' LIMIT 1),
  'Meat production',
  now(),
  now()
FROM generate_series(1, 20);

INSERT INTO animals (id, user_id, animal_type, breed, tag_number, gender, age_months, weight_kg, health_status, location, date_acquired, purchase_price, vendor_id, notes, created_at, updated_at)
VALUES
  (gen_random_uuid(), auth.uid(), 'turkey', 'Broad Breasted White', 'TRK-0001', 'male', 8, 12.5, 'healthy', 'Barn B', CURRENT_DATE - 240, 45, (SELECT id FROM vendors WHERE vendor_type = 'supplier' LIMIT 1), 'Premium quality', now(), now()),
  (gen_random_uuid(), auth.uid(), 'turkey', 'Broad Breasted White', 'TRK-0002', 'female', 7, 9.8, 'healthy', 'Barn B', CURRENT_DATE - 210, 40, (SELECT id FROM vendors WHERE vendor_type = 'supplier' LIMIT 1), 'Good breeder', now(), now()),
  (gen_random_uuid(), auth.uid(), 'goose', 'Embden', 'GSE-0001', 'female', 12, 8.5, 'healthy', 'Pond Area', CURRENT_DATE - 360, 35, (SELECT id FROM vendors WHERE vendor_type = 'supplier' LIMIT 1), 'Egg layer', now(), now());

-- Add production records (eggs, meat, etc.)
INSERT INTO production (id, user_id, product_type, production_date, quantity, unit, quality_grade, batch_number, location, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  auth.uid(),
  'eggs',
  CURRENT_DATE - generate_series,
  floor(random() * 200 + 150)::numeric,
  'dozen',
  CASE 
    WHEN random() < 0.6 THEN 'Grade A'
    WHEN random() < 0.9 THEN 'Grade B'
    ELSE 'Grade C'
  END,
  'BATCH-' || TO_CHAR(CURRENT_DATE - generate_series, 'YYYYMMDD'),
  'Coop A',
  'Daily collection',
  now(),
  now()
FROM generate_series(0, 30);

INSERT INTO production (id, user_id, product_type, production_date, quantity, unit, quality_grade, batch_number, location, notes, created_at, updated_at)
VALUES
  (gen_random_uuid(), auth.uid(), 'meat', CURRENT_DATE - 5, 150, 'kg', 'Premium', 'MEAT-20250325', 'Processing Unit', 'Chicken meat processed', now(), now()),
  (gen_random_uuid(), auth.uid(), 'meat', CURRENT_DATE - 12, 80, 'kg', 'Premium', 'MEAT-20250318', 'Processing Unit', 'Duck meat processed', now(), now()),
  (gen_random_uuid(), auth.uid(), 'feathers', CURRENT_DATE - 5, 25, 'kg', 'Grade A', 'FEATH-20250325', 'Processing Unit', 'By-product collection', now(), now());

-- Add sales records
INSERT INTO sales (id, user_id, sale_date, product_type, quantity, unit_price, total_amount, customer_name, customer_email, customer_phone, payment_method, payment_status, invoice_number, vendor_id, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  auth.uid(),
  CURRENT_DATE - floor(random() * 60)::integer,
  'Eggs',
  floor(random() * 100 + 20)::numeric,
  4.50,
  (floor(random() * 100 + 20) * 4.50)::numeric,
  v.name,
  v.email,
  v.phone,
  CASE 
    WHEN random() < 0.4 THEN 'cash'
    WHEN random() < 0.7 THEN 'bank_transfer'
    ELSE 'check'
  END,
  CASE WHEN random() < 0.9 THEN 'paid' ELSE 'pending' END,
  'INV-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 1000)::text, 4, '0'),
  v.id,
  'Regular order',
  now(),
  now()
FROM vendors v
WHERE v.vendor_type = 'customer'
LIMIT 15;

INSERT INTO sales (id, user_id, sale_date, product_type, quantity, unit_price, total_amount, customer_name, customer_email, customer_phone, payment_method, payment_status, invoice_number, vendor_id, notes, created_at, updated_at)
VALUES
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 3, 'Chicken Meat', 50, 8.50, 425, 'City Fresh Market', 'emily@cityfresh.com', '+1-555-0201', 'bank_transfer', 'paid', 'INV-20250327-0001', (SELECT id FROM vendors WHERE name = 'City Fresh Market'), 'Premium cuts', now(), now()),
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 7, 'Duck Meat', 30, 12.00, 360, 'Restaurant Group LLC', 'david@restaurantgroup.com', '+1-555-0202', 'bank_transfer', 'paid', 'INV-20250323-0002', (SELECT id FROM vendors WHERE name = 'Restaurant Group LLC'), 'Special order', now(), now()),
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 1, 'Eggs', 200, 4.50, 900, 'Local Grocery Chain', 'lisa@localgrocery.com', '+1-555-0203', 'bank_transfer', 'pending', 'INV-20250329-0003', (SELECT id FROM vendors WHERE name = 'Local Grocery Chain'), 'Weekly delivery', now(), now());

-- Add expenses
INSERT INTO expenses (id, user_id, expense_date, category, amount, description, vendor_name, vendor_id, payment_method, receipt_number, is_recurring, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  auth.uid(),
  CURRENT_DATE - floor(random() * 90)::integer,
  'feed',
  random() * 500 + 200,
  'Poultry feed purchase',
  'Green Valley Feed Supply',
  (SELECT id FROM vendors WHERE name = 'Green Valley Feed Supply'),
  CASE 
    WHEN random() < 0.5 THEN 'bank_transfer'
    ELSE 'check'
  END,
  'RCP-' || LPAD(floor(random() * 10000)::text, 5, '0'),
  false,
  'Monthly feed stock',
  now(),
  now()
FROM generate_series(1, 12);

INSERT INTO expenses (id, user_id, expense_date, category, amount, description, vendor_name, vendor_id, payment_method, receipt_number, is_recurring, notes, created_at, updated_at)
VALUES
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 5, 'veterinary', 350, 'Routine health checkup', 'Veterinary Clinic', NULL, 'cash', 'RCP-VET-001', false, 'Annual checkup for flock', now(), now()),
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 15, 'equipment', 1200, 'New incubator purchase', 'Farm Equipment Co', (SELECT id FROM vendors WHERE name = 'Farm Equipment Co'), 'bank_transfer', 'RCP-EQ-045', false, 'Capacity expansion', now(), now()),
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 20, 'utilities', 450, 'Electricity bill', 'Power Company', NULL, 'bank_transfer', 'RCP-UTIL-789', true, 'Monthly utility', now(), now()),
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 25, 'maintenance', 280, 'Coop repairs', 'Local Handyman', NULL, 'cash', 'RCP-MAINT-123', false, 'Fixed roof leak', now(), now()),
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 30, 'supplies', 175, 'Cleaning supplies and bedding', 'Farm Supply Store', NULL, 'cash', 'RCP-SUP-456', false, 'Monthly supplies', now(), now());

-- Add income records (non-sales income like grants, subsidies, etc.)
INSERT INTO income (id, user_id, income_date, source, amount, description, payment_method, reference_number, customer_name, notes, created_at, updated_at)
VALUES
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 10, 'grant', 5000, 'Agricultural development grant', 'bank_transfer', 'GRANT-2025-001', 'State Agriculture Department', 'Annual farming grant', now(), now()),
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 45, 'subsidy', 2500, 'Poultry farming subsidy', 'bank_transfer', 'SUB-2025-Q1', 'Federal Farm Program', 'Quarterly subsidy payment', now(), now()),
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 60, 'other', 800, 'Equipment rental income', 'cash', 'RENT-2025-02', 'Neighbor Farm', 'Rented out tractor', now(), now()),
  (gen_random_uuid(), auth.uid(), CURRENT_DATE - 75, 'investment', 1500, 'Investment returns', 'bank_transfer', 'INV-DIV-2025', 'Farm Cooperative', 'Dividend payment', now(), now());

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Sample data seeded successfully!';
  RAISE NOTICE 'Added: 6 vendors, 5 employees, 73 animals, 34 production records, 18 sales, 17 expenses, 4 income records';
END $$;
