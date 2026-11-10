interface ChatAvatarProps {
  name: string;
  photo?: string | null;
  className: string;
}

export function ChatAvatar({ name, photo, className }: ChatAvatarProps) {
  const initial = name.trim().charAt(0).toLocaleUpperCase() || "?";
  return (
    <span className={className} aria-hidden="true">
      {photo ? <img src={photo} alt="" /> : initial}
    </span>
  );
}
