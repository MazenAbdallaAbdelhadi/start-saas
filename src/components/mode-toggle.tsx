"use client";
import { useEffect, useEffectEvent, useState } from "react";
import { useTheme } from "next-themes";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const mountEffect = useEffectEvent((v: boolean) => setMounted(v));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    mountEffect(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant={theme === "system" ? "secondary" : "ghost"}
        className="size-12 p-0 rounded-full"
        onClick={() => setTheme("system")}
      >
        <MonitorIcon className="size-5" />
      </Button>
      <Button
        variant={theme === "light" ? "secondary" : "ghost"}
        className="size-12 p-0 rounded-full"
        onClick={() => setTheme("light")}
      >
        <SunIcon className="size-5" />
      </Button>
      <Button
        variant={theme === "dark" ? "secondary" : "ghost"}
        className="size-12 p-0 rounded-full"
        onClick={() => setTheme("dark")}
      >
        <MoonIcon className="size-5" />
      </Button>
    </div>
  );
}
