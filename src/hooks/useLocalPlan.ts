"use client";

import { useEffect, useState } from "react";
import {
  LOCAL_PLAN_EVENT,
  readLocalPlan,
  writeLocalPlan,
  type LocalPlan,
} from "@/lib/plan/local-plan";

export function useLocalPlan() {
  const [plan, setPlan] = useState<LocalPlan>("free");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPlan(readLocalPlan());
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== "larpcity.plan.v1") return;
      setPlan(readLocalPlan());
    };
    const onCustom = () => setPlan(readLocalPlan());

    window.addEventListener("storage", onStorage);
    window.addEventListener(LOCAL_PLAN_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCAL_PLAN_EVENT, onCustom);
    };
  }, []);

  function setLocalPlan(next: LocalPlan) {
    writeLocalPlan(next);
    setPlan(next);
  }

  return { plan, ready, setLocalPlan, isPro: plan === "pro" };
}
