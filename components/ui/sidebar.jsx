"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const SidebarContext = React.createContext({
  open: true,
  setOpen: () => {},
});

export function SidebarProvider({ children, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger({ className }) {
  const { open, setOpen } = React.useContext(SidebarContext);

  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500",
        className
      )}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={open ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"}
        />
      </svg>
    </button>
  );
}

export function useSidebar() {
  return React.useContext(SidebarContext);
}
