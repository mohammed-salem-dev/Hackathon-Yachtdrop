"use client";

import Image from "next/image";

type Props = {
  src: string;
  alt: string;
};

export default function ProductImage({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      className="object-cover"
      priority
      unoptimized
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/placeholder-product.png";
      }}
    />
  );
}
