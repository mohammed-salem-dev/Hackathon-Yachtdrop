"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import CartDrawer from "@/components/CartDrawer";
import BottomNav from "@/components/BottomNav";
import AiFab from "@/components/AiFab";
import AiMatchSheet from "@/components/AiMatchSheet";
import AuthModal from "@/components/AuthModal";
import { useCartDrawerStore } from "@/lib/cartDrawerStore";

const HEADERLESS_ROUTES = ["/checkout"];

export default function ShellClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showHeader = !HEADERLESS_ROUTES.includes(pathname);

  const {
    isOpen: drawerOpen,
    open: openDrawer,
    close: closeDrawer,
  } = useCartDrawerStore();
  const [aiSheetOpen, setAiSheetOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function openAuth(tab: "login" | "signup") {
    setAuthTab(tab);
    setAuthOpen(true);
  }

  return (
    <>
      {showHeader && (
        <AppHeader onAuthOpen={openAuth} onCartOpen={openDrawer} />
      )}

      <main className="pb-20 w-full">{children}</main>

      {mounted && (
        <>
          <CartDrawer isOpen={drawerOpen} onClose={closeDrawer} />
          <AiFab onClick={() => setAiSheetOpen(true)} />
          <AiMatchSheet
            isOpen={aiSheetOpen}
            onClose={() => setAiSheetOpen(false)}
          />
          <AuthModal
            isOpen={authOpen}
            onClose={() => setAuthOpen(false)}
            defaultTab={authTab}
          />
        </>
      )}

      <BottomNav />
    </>
  );
}
