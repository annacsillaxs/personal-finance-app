import { Button } from "@/components/ui/Button";
import { PotCard } from "@/components/pots/PotCard";
import { getCurrentUserId } from "@/lib/services/auth";
import { listPots } from "@/lib/services/pots";
import styles from "./page.module.css";

export const metadata = { title: "Pots — finance" };

// Money changes on write, so never serve a cached copy.
export const dynamic = "force-dynamic";

export default async function PotsPage() {
  // A Server Component calls the service directly. Fetching our own /api route
  // over HTTP here would add a round trip and lose the request context.
  const userId = await getCurrentUserId();
  const pots = await listPots(userId);

  return (
    <>
      <div className={styles.header}>
        <h1 className="text-preset-1">Pots</h1>
        <Button disabled>+ Add New Pot</Button>
      </div>

      {pots.length === 0 ? (
        <p className={`text-preset-4 ${styles.empty}`}>
          No pots yet. Create one to start saving towards a goal.
        </p>
      ) : (
        <div className={styles.grid}>
          {pots.map((pot) => (
            <PotCard key={pot.id} pot={pot} />
          ))}
        </div>
      )}
    </>
  );
}
