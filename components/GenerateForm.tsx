"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateToken } from "@/app/actions/generateToken";

export function GenerateForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      onClick={() =>
        startTransition(async () => {
          await generateToken();
          router.refresh(); // Refresh to load cookie
        })
      }
      disabled={isPending}
    >
      {isPending ? "Generating..." : "Generate API Key"}
    </Button>
  );
}
