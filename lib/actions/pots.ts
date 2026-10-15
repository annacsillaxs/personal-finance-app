"use server";

import { revalidatePath } from "next/cache";
import { toCents } from "@/lib/money";
import { getCurrentUserId } from "@/lib/services/auth";
import { ServiceError } from "@/lib/services/errors";
import { addToPot } from "@/lib/services/pots";

export type AddMoneyState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; field: "amount" };

export async function addMoneyAction(
  prevState: AddMoneyState,
  formData: FormData
): Promise<AddMoneyState> {
  const potId = formData.get("potId");
  const rawAmount = formData.get("amount");

  if (typeof potId !== "string" || typeof rawAmount !== "string") {
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
      field: "amount",
    };
  }

  let amountCents: number;
  try {
    amountCents = toCents(rawAmount);
  } catch {
    return {
      status: "error",
      message: "Please enter a valid amount, for example 50.00",
      field: "amount",
    };
  }

  const userId = await getCurrentUserId();

  try {
    await addToPot({ userId, potId, amountCents });
  } catch (error) {
    if (error instanceof ServiceError) {
      return { status: "error", message: error.message, field: "amount" };
    }
    throw error;
  }

  revalidatePath("/pots");
  return { status: "success" };
}
