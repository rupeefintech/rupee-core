// components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { HomeIcon, CreditCardIcon, BookOpenIcon,BanknoteIcon } from "lucide-react";

export function Sidebar() {
  const links = [
    { name: "Dashboard", icon: <HomeIcon />, path: "/" },
    { name: "Credit Cards", icon: <CreditCardIcon />, path: "/admin/credit-cards" },
    { name: "Banks", icon: <BanknoteIcon />, path: "/admin/banks" },
    { name: "Blog", icon: <BookOpenIcon />, path: "/admin/blog" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="h-16 flex items-center justify-center gap-2 text-xl font-bold border-b">
        <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center shrink-0 p-0.5">
          <img src="/logo.png" alt="Rupeepedia" className="h-full w-full object-contain" />
        </div>
        Rupeepedia
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 rounded-md hover:bg-blue-100 ${
                isActive ? "bg-blue-200 font-semibold" : ""
              }`
            }
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}