'use client';

import { usePathname } from "next/navigation";
import { MiniSidebar } from "@/components/ui/mini-sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isChatPage = pathname === '/chat';

  return (
    <div className="flex min-h-screen">
      {isChatPage && <MiniSidebar />}
      <div className={`flex-1 ${isChatPage ? 'pl-16' : ''}`}>{children}</div>
    </div>
  );
} 