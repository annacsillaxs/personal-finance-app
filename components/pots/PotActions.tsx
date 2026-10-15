"use client";

import { useCallback, useState } from "react";
import type { PotSummary } from "@/lib/services/pots";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AddMoneyForm } from "@/components/pots/AddMoneyForm";

export function PotActions({ pot }: { pot: PotSummary }) {
  const [isOpen, setIsOpen] = useState(false);
  const handleSuccess = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        + Add Money
      </Button>
      <Button variant="secondary" disabled>
        Withdraw
      </Button>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Add to '${pot.name}'`}
        description="Add money to your pot to keep it separate from your main balance. As soon as you add this money, it will be deducted from your current balance."
      >
        <AddMoneyForm pot={pot} onSuccess={handleSuccess} />
      </Modal>
    </>
  );
}
