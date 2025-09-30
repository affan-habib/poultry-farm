// This script creates test users using Supabase Admin API
// Run this script to create test accounts for development

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const testUsers = [
  {
    email: "admin@poultry.com",
    password: "Admin123!",
    profile: {
      full_name: "John Admin",
      phone: "+1234567890",
      role: "admin",
      farm_name: "Sunrise Poultry Farm",
      farm_location: "California, USA",
    },
  },
  {
    email: "staff@poultry.com",
    password: "Staff123!",
    profile: {
      full_name: "Jane Staff",
      phone: "+1234567891",
      role: "staff",
      farm_name: "Morning Glory Farm",
      farm_location: "Texas, USA",
    },
  },
  {
    email: "manager@poultry.com",
    password: "Manager123!",
    profile: {
      full_name: "Mike Manager",
      phone: "+1234567892",
      role: "admin",
      farm_name: "Golden Egg Farms",
      farm_location: "Florida, USA",
    },
  },
]

async function createTestUsers() {
  console.log("Creating test users...\n")

  for (const user of testUsers) {
    console.log(`Creating user: ${user.email}`)

    // Create user with admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: user.profile,
    })

    if (authError) {
      console.error(`Error creating ${user.email}:`, authError.message)
      continue
    }

    console.log(`✓ Created auth user: ${user.email}`)

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: user.email,
      ...user.profile,
    })

    if (profileError) {
      console.error(`Error creating profile for ${user.email}:`, profileError.message)
    } else {
      console.log(`✓ Created profile for: ${user.email}`)
    }

    console.log("")
  }

  // Add sample data for admin user
  console.log("Adding sample data for admin@poultry.com...")

  const { data: adminUser } = await supabase.from("profiles").select("id").eq("email", "admin@poultry.com").single()

  if (adminUser) {
    // Sample vendors
    await supabase.from("vendors").insert([
      {
        user_id: adminUser.id,
        name: "Premium Feed Supply",
        vendor_type: "supplier",
        contact_person: "Bob Smith",
        phone: "+1555123456",
        email: "bob@premiumfeed.com",
        address: "123 Feed St, CA",
      },
      {
        user_id: adminUser.id,
        name: "Fresh Market Co",
        vendor_type: "customer",
        contact_person: "Alice Johnson",
        phone: "+1555654321",
        email: "alice@freshmarket.com",
        address: "456 Market Ave, CA",
      },
    ])

    // Sample animals
    await supabase.from("animals").insert([
      {
        user_id: adminUser.id,
        animal_type: "chicken",
        breed: "Rhode Island Red",
        tag_number: "CH001",
        date_acquired: "2024-01-15",
        age_months: 6,
        gender: "Female",
        health_status: "healthy",
        weight_kg: 2.5,
        purchase_price: 15.0,
        location: "Coop A",
      },
      {
        user_id: adminUser.id,
        animal_type: "chicken",
        breed: "Leghorn",
        tag_number: "CH002",
        date_acquired: "2024-01-15",
        age_months: 6,
        gender: "Female",
        health_status: "healthy",
        weight_kg: 2.2,
        purchase_price: 15.0,
        location: "Coop A",
      },
    ])

    // Sample production
    await supabase.from("production").insert([
      {
        user_id: adminUser.id,
        production_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        product_type: "eggs",
        quantity: 120,
        unit: "pieces",
        quality_grade: "Grade A",
        batch_number: "BATCH001",
      },
    ])

    // Sample sales
    await supabase.from("sales").insert([
      {
        user_id: adminUser.id,
        sale_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        customer_name: "Fresh Market Co",
        customer_phone: "+1555654321",
        product_type: "Eggs (Grade A)",
        quantity: 100,
        unit_price: 0.5,
        total_amount: 50.0,
        payment_method: "bank_transfer",
        payment_status: "paid",
        invoice_number: "INV001",
      },
    ])

    // Sample expenses
    await supabase.from("expenses").insert([
      {
        user_id: adminUser.id,
        expense_date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
        category: "feed",
        description: "Chicken Feed - 50kg bags",
        amount: 150.0,
        vendor_name: "Premium Feed Supply",
        payment_method: "bank_transfer",
        receipt_number: "RCP001",
      },
    ])

    console.log("✓ Sample data added successfully")
  }

  console.log("\n=== Test Users Created ===")
  console.log("You can now login with:")
  console.log("1. admin@poultry.com / Admin123!")
  console.log("2. staff@poultry.com / Staff123!")
  console.log("3. manager@poultry.com / Manager123!")
}

createTestUsers()
  .then(() => {
    console.log("\nDone!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })
