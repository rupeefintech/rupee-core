import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HomeIcon, CreditCardIcon, BanknoteIcon, Users, Search, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { clearAdminToken } from "../utils/adminApi";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();

  const links = [
    { name: "Dashboard", icon: <HomeIcon size={18} />, path: "/admin", end: true },
    { name: "Products", icon: <CreditCardIcon size={18} />, path: "/admin/credit-cards", end: false },
    { name: "Banks", icon: <BanknoteIcon size={18} />, path: "/admin/banks", end: false },
    { name: "Users", icon: <Users size={18} />, path: "/admin/users", end: false },
  ];

  const handleLogout = () => {
    clearAdminToken();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar — blue to match mockup */}
      <aside className="w-56 bg-[#1e3a5f] text-white flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
          <div className="h-7 w-7 bg-white rounded-md flex items-center justify-center shrink-0 p-0.5">
            <img src="/logo.png" alt="Rupeepedia" className="h-full w-full object-contain" />
          </div>
          <span className="text-[15px] font-bold tracking-tight">Rupeepedia Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar — search + avatar like mockup */}
        <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0">
          <div />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-gray-400" />
              <span className="text-sm text-gray-400">Search</span>
              <span className="text-xs text-gray-400 ml-4">&#9662;</span>
            </div>
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="https://ui-avatars.com/api/?name=Admin&background=1e3a5f&color=fff&size=36"
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <motion.main
          className="flex-1 p-6 overflow-auto bg-gray-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
