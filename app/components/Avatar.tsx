type AvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
};

const SIZE_MAP = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-2xl",
};

export default function Avatar({ src, name, size = "md" }: AvatarProps) {
  const sizeClass = SIZE_MAP[size];
  const initial = (name ?? "?")[0].toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? ""}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0`}
    >
      {initial}
    </div>
  );
}
