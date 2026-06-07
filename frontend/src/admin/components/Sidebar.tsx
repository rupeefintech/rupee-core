import { NavLink } from "react-router-dom";
import { HomeIcon, CreditCardIcon, BookOpenIcon, BanknoteIcon, Building2, Mail, Users } from "lucide-react";

export function Sidebar() {
  const links = [
    { name: "Dashboard",    icon: <HomeIcon size={16} />,        path: "/admin/dashboard" },
    { name: "Credit Cards", icon: <CreditCardIcon size={16} />,  path: "/admin/credit-cards" },
    { name: "Banks",        icon: <Building2 size={16} />,       path: "/admin/banks" },
    { name: "Rates",        icon: <BanknoteIcon size={16} />,    path: "/admin/rates" },
    { name: "Blog",         icon: <BookOpenIcon size={16} />,    path: "/admin/blog" },
    { name: "Users",        icon: <Users size={16} />,           path: "/admin/users" },
    { name: "Contacts",     icon: <Mail size={16} />,            path: "/admin/contacts" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="h-16 flex items-center justify-center gap-2 text-xl font-bold border-b">
        <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center shrink-0 p-0.5">
          <img src="/logo.png" alt="Rupeepedia" className="h-full w-full object-contain" />
        </div>
        Rupeepedia
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
