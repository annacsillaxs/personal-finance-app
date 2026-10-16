"use client";

import { PotForm } from "@/components/pots/PotForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCallback, useState } from "react";

type Props = {
  usedThemes: string[];
};

export function NewPotButton({ usedThemes }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const handleSuccess = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>+ Add New Pot</Button>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add new pot"
        description="Create a pot to set savings targets. These can help keep you on track as you save for special purchases."
      >
        <PotForm onSuccess={handleSuccess} usedThemes={usedThemes}></PotForm>
      </Modal>
    </>
  );
}
