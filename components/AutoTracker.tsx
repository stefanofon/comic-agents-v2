"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track, EVENTS } from "@/lib/analytics";

export default function AutoTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track(EVENTS.PAGE_VIEW, { page: pathname });
  }, [pathname]);

  useEffect(() => {
    const hasStarted = sessionStorage.getItem("ca_tracked_start");
    if (!hasStarted) {
      track(EVENTS.SESSION_START, {});
      sessionStorage.setItem("ca_tracked_start", "1");
    }
  }, []);

  return null;
}
