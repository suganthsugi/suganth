"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Delete a contact message from the admin Messages list. */
export async function deleteMessage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
}
