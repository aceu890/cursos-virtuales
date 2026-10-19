"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "../ui/Button";
import { IconInstall } from "../ui/Icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function subscribeStandalone(onStoreChange: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function InstallPrompt({
  variant = "button",
}: {
  variant?: "button" | "icon";
}) {
  const standalone = useSyncExternalStore(
    subscribeStandalone,
    getStandalone,
    () => false,
  );
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone || installed || !event) {
    return null;
  }

  async function install() {
    await event?.prompt();
    setEvent(null);
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="knob pressable grid h-11 w-11 place-items-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="Instalar app"
      >
        <IconInstall />
      </button>
    );
  }

  return (
    <Button variant="secondary" className="min-h-10 px-3 text-xs" onClick={() => void install()}>
      Instalar app
    </Button>
  );
}
