import React from "react";
import CmdSidebar from "@/components/cmd/CmdSidebar";
import CmdHeader from "@/components/cmd/CmdHeader";

export default function CmdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cmd-bg text-cmd-text font-mono antialiased">
      <CmdSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <CmdHeader />
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
