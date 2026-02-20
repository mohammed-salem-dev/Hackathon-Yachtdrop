import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  className?: string;
};

const sizeMap = {
  sm: { height: 20, width: 20, text: "text-sm" },
  md: { height: 28, width: 28, text: "text-lg" },
  lg: { height: 36, width: 36, text: "text-2xl" },
};

export default function YachtDropLogo({
  size = "md",
  variant = "dark",
  className,
}: Props) {
  const { height, width, text } = sizeMap[size];
  const wordmarkColor = variant === "dark" ? "#0A1628" : "#FFFFFF";

  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 select-none", className)}
    >
      {/* Logo icon image */}
      <Image
        src="/logo.png"
        alt="Yachtdrop"
        height={height}
        width={width}
        className="object-contain"
        priority
      />
      {/* Text */}
      <span className="wixui-rich-text__text">Yachtdrop</span>
    </Link>
  );
}
