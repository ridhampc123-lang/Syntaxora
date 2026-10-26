import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const adminEmail = process.argv[2] || "admin@syntaxora.com";
  const adminPassword = process.argv[3] || "AdminPassword123!";

  console.log(`Provisioning administrator account for: ${adminEmail}`);

  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to check existing users:", listError.message);
    process.exit(1);
  }

  let user = listData.users.find((u) => u.email === adminEmail);

  if (!user) {
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        full_name: "Academy Administrator",
      },
    });

    if (createError) {
      console.error("Failed to create admin auth user:", createError.message);
      process.exit(1);
    }
    user = createData.user;
    console.log(`Created auth user (ID: ${user.id})`);
  } else {
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        full_name: "Academy Administrator",
      },
    });

    if (updateError) {
      console.error("Failed to update admin auth user:", updateError.message);
      process.exit(1);
    }
    console.log(`Updated auth user password (ID: ${user.id})`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: adminEmail,
    full_name: "Academy Administrator",
    role: "admin",
  });

  if (profileError) {
    console.error("Failed to upsert admin profile:", profileError.message);
    process.exit(1);
  }

  console.log("Admin account successfully provisioned!");
  console.log(`Email:    ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
