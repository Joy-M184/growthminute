import { createClient } from "@/lib/supabase/server";

export async function getGrowthMinuteUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
