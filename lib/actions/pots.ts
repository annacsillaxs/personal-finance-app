"use server";

import { revalidatePath } from "next/cache";
import { toCents } from "@/lib/money";
import { getCurrentUserId } from "@/lib/services/auth";
import { ConflictError, ServiceError } from "@/lib/services/errors";
import { addToPot, createPot, withdrawFromPot } from "@/lib/services/pots";

export type PotMoneyState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; field: "amount" };

export type PotFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; field: "name" | "target" };

export async function addMoneyAction(
  prevState: PotMoneyState,
  formData: FormData
): Promise<PotMoneyState> {
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

export async function withdrawAction(
  prevState: PotMoneyState,
  formData: FormData
): Promise<PotMoneyState> {
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
    await withdrawFromPot({ userId, potId, amountCents });
  } catch (error) {
    if (error instanceof ServiceError) {
      return { status: "error", message: error.message, field: "amount" };
    }
    throw error;
  }

  revalidatePath("/pots");
  return { status: "success" };
}

export async function createPotAction(
  prevState: PotFormState,
  formData: FormData
): Promise<PotFormState> {
  const rawName = formData.get("name");
  const rawTarget = formData.get("target");
  const theme = formData.get("theme");

  if (
    typeof rawName !== "string" ||
    typeof rawTarget !== "string" ||
    typeof theme !== "string"
  ) {
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
      field: "name",
    };
  }

  const name = rawName.trim();

  if (!name) {
    return { status: "error", message: "Pot name is required", field: "name" };
  }

  if (name.length > 30) {
    return {
      status: "error",
      message: "Pot name must be 30 characters or fewer",
      field: "name",
    };
  }

  let targetCents: number;
  try {
    targetCents = toCents(rawTarget);
  } catch {
    return {
      status: "error",
      message: "Please enter a valid target, for example 2000.00",
      field: "target",
    };
  }

  const userId = await getCurrentUserId();

  try {
    await createPot({ userId, name, targetCents, theme });
  } catch (error) {
    if (error instanceof ConflictError) {
      return {
        status: "error",
        message: error.message,
        field: "name",
      };
    }
    if (error instanceof ServiceError) {
      return {
        status: "error",
        message: error.message,
        field: "target",
      };
    }
    throw error;
  }

  revalidatePath("/pots");
  return { status: "success" };
}
