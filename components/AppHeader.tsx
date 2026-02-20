"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, UserCircle } from "lucide-react";
import YachtDropLogo from "@/components/YachtDropLogo";
import StickyCartBar from "@/components/StickyCartBar";

type Props = {
  title?: string;
  showBack?: boolean;
  onAuthOpen: (tab: "login" | "signup") => void;
  onCartOpen: () => void;
};

const routeTitles: Record<string, string> = {
  // "/cart": "Your Cart",
  //"/checkout": "Checkout",
  //"/orders": "Order History",
  //"/marina": "Marina Info",
};

export default function AppHeader({
  title,
  showBack,
  onAuthOpen,
  onCartOpen,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const pageTitle = title ?? routeTitles[pathname] ?? "";
  const canGoBack = showBack ?? !isHome;

  return (
    <header
      className="sticky top-0 z-40 w-full
      bg-brand-surface border-b border-brand-border/70 px-4 pt-safe"
    >
      <div className="flex items-center h-14 gap-3">
        {canGoBack && (
          <button
            onClick={() => router.back()}
            className="min-h-[48px] min-w-[48px] -ml-2 flex items-center
              justify-center text-brand-muted active:text-brand-navy"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {isHome ? (
          <YachtDropLogo size="md" variant="dark" />
        ) : (
          <div className="flex items-center gap-3">
            {/* Make the whole left side clickable to go home */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3"
            >
              <YachtDropLogo size="sm" variant="dark" />
              {pageTitle && (
                <>
                  <span className="text-brand-border text-lg font-light">
                    /
                  </span>
                  <span className="text-sm font-semibold text-brand-ink">
                    {pageTitle}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Single user icon — opens login tab by default */}
          <button
            onClick={() => onAuthOpen("login")}
            className="w-9 h-9 rounded-xl flex items-center justify-center
              text-brand-navy hover:bg-brand-teal/10 hover:text-brand-teal
              transition-all duration-200"
            aria-label="Log in or Sign up"
          >
            <UserCircle size={24} />
          </button>

          <StickyCartBar onOpen={onCartOpen} />
        </div>
      </div>
    </header>
  );
}
