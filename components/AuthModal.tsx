"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import Image from "next/image";
import Drawer from "@/components/Drawer";

type Tab = "login" | "signup";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: Tab;
};

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
}: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // hook up your auth logic here
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      title={
        <div className="flex items-center gap-2">
          {/* ✅ Same logo as home page */}
          <Image
            src="/logo.png"
            alt="Yachtdrop"
            width={28}
            height={28}
            className="rounded-xl object-contain"
          />
          <span className="font-bold text-brand-navy text-sm">Yachtdrop</span>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Tab switcher */}
        <div className="flex bg-brand-surface rounded-2xl p-1 gap-1">
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold
                transition-all duration-200
                ${
                  tab === t
                    ? "bg-white text-brand-navy shadow-sm"
                    : "text-brand-muted"
                }`}
            >
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Name — signup only */}
          <AnimatePresence initial={false}>
            {tab === "signup" && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted"
                  />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl
                      bg-brand-surface border border-brand-border
                      text-sm text-brand-ink placeholder:text-brand-muted
                      focus:outline-none focus:border-brand-teal transition-colors"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-2xl
                bg-brand-surface border border-brand-border
                text-sm text-brand-ink placeholder:text-brand-muted
                focus:outline-none focus:border-brand-teal transition-colors"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-2xl
                bg-brand-surface border border-brand-border
                text-sm text-brand-ink placeholder:text-brand-muted
                focus:outline-none focus:border-brand-teal transition-colors"
            />
          </div>

          {/* Forgot password */}
          {tab === "login" && (
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                className="text-[11px] text-brand-teal font-medium
                  hover:opacity-70 transition-opacity"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* ✅ Submit — brand-navy */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-brand-navy text-white
              font-semibold text-sm mt-1
              active:brightness-90 transition-all duration-200"
          >
            {tab === "login" ? "Log In" : "Create Account"}
          </button>

          {/* Switch tab hint */}
          <p className="text-center text-[11px] text-brand-muted">
            {tab === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => setTab(tab === "login" ? "signup" : "login")}
              className="text-brand-teal font-semibold"
            >
              {tab === "login" ? "Sign Up" : "Log In"}
            </button>
          </p>
        </form>
      </div>
    </Drawer>
  );
}
