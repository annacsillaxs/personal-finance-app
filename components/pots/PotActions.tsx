"use client";

import { useCallback, useState } from "react";
import type { PotSummary } from "@/lib/services/pots";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AddMoneyForm } from "@/components/pots/AddMoneyForm";
import { WithdrawMoneyForm } from "@/components/pots/WithdrawMoneyForm";

export function PotActions({ pot }: { pot: PotSummary }) {
  const [isOpen, setIsOpen] = useState<"add" | "withdraw" | null>(null);
  const handleSuccess = useCallback(() => setIsOpen(null), []);

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen("add")}>
        + Add Money
      </Button>
      <Button variant="secondary" onClick={() => setIsOpen("withdraw")}>
        Withdraw
      </Button>
      <Modal
        open={isOpen === "add"}
        onClose={() => setIsOpen(null)}
        title={`Add to '${pot.name}'`}
        description="Add money to your pot to keep it separate from your main balance. As soon as you add this money, it will be deducted from your current balance."
      >
        <AddMoneyForm pot={pot} onSuccess={handleSuccess} />
      </Modal>
      <Modal
        open={isOpen === "withdraw"}
        onClose={() => setIsOpen(null)}
        title={`Withdraw from '${pot.name}'`}
        description="Withdraw money from your pot to add it back to your main balance. As soon as you withdraw this money, it will be added to your current balance."
      >
        <WithdrawMoneyForm pot={pot} onSuccess={handleSuccess} />
      </Modal>
    </>
  );
}
