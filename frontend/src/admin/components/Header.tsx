// components/Header.tsx
import { BellIcon, UserIcon } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white shadow-sm border-b">
      <div className="text-lg font-semibold">Admin Panel</div>
      <div className="flex items-center gap-4">
        <BellIcon className="w-5 h-5 text-gray-600 cursor-pointer" />
        <div className="flex items-center gap-2 cursor-pointer">
          <UserIcon className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
}