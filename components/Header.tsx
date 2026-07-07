import { HeaderAvatarMenu } from "./HeaderAvatarMenu";

export function Header() {
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="logo-mark" aria-hidden="true">
          W
        </span>
        <span className="text-base font-medium text-[#2a2a2a]">
          Welcome Health
        </span>
      </div>
      <HeaderAvatarMenu />
    </header>
  );
}
