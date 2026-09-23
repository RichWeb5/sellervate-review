import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BrandSummary = {
  id: string;
  slug: string;
  name: string;
  accentColor: string;
};

export type Viewer = {
  id: string;
  fullName: string;
  email: string;
  leads: BrandSummary[];
  writesFor: BrandSummary[];
};

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, brand_memberships (role, brands (id, slug, name, accent_color))")
    .eq("id", userId)
    .single();
  if (error) throw error;

  const brandsWithRole = (role: "lead" | "specialist") =>
    profile.brand_memberships
      .filter((membership) => membership.role === role)
      .map(({ brands }) => ({
        id: brands.id,
        slug: brands.slug,
        name: brands.name,
        accentColor: brands.accent_color,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    leads: brandsWithRole("lead"),
    writesFor: brandsWithRole("specialist"),
  };
});

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  return viewer;
}
