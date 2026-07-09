import { HeaderAvatarMenu } from "./HeaderAvatarMenu";

export function Header() {
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between bg-[#1b4332] px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="logo-mark logo-mark-light" aria-hidden="true">
          W
        </span>
        <span className="text-base font-semibold text-white">
          Welcome Health
        </span>
      </div>
      <HeaderAvatarMenu />
    </header>
  );
}
