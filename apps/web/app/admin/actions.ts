"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { AdminApiError, updateAdminBookingStatus } from "@/lib/api/admin";
import { AdminBookingAction } from "@/lib/types/admin";

export type AdminLoginActionState = {
  error: string | null;
};

export async function loginAdminAction(
  _previousState: AdminLoginActionState,
  formData: FormData
): Promise<AdminLoginActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/bookings"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Invalid email or password."
      };
    }

    throw error;
  }

  return {
    error: null
  };
}

export async function logoutAdminAction() {
  await signOut({
    redirectTo: "/admin/login"
  });
}

export async function updateBookingStatusAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") || "");
  const action = String(formData.get("action") || "") as AdminBookingAction;

  if (!bookingId || !["accept", "reject", "cancel"].includes(action)) {
    redirect("/admin/bookings");
  }

  try {
    await updateAdminBookingStatus(bookingId, action);
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);
    redirect(`/admin/bookings/${bookingId}?updated=${action}`);
  } catch (error) {
    const message =
      error instanceof AdminApiError ? error.message : "Unable to update booking status.";

    redirect(`/admin/bookings/${bookingId}?error=${encodeURIComponent(message)}`);
  }
}
