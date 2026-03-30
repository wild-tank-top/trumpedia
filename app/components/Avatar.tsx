import Image from "next/image";

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
};

const SIZE_MAP = {
  sm: { cls: "w-8 h-8 text-sm",   px: 32 },
  md: { cls: "w-12 h-12 text-base", px: 48 },
  lg: { cls: "w-16 h-16 text-2xl", px: 64 },
};

export default function Avatar({ src, name, size = "md" }: AvatarProps) {
  const { cls, px } = SIZE_MAP[size];
  const initial = (name ?? "?")[0].toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? ""}
        width={px}
        height={px}
        className={`${cls} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${cls} rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0`}
    >
      {initial}
    </div>
  );
}
