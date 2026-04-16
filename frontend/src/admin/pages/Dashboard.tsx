import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Building2, Gift } from "lucide-react";
import { adminApi } from "../utils/adminApi";
import AdminLayout from "../layout/AdminLayout";

interface Stats {
  products: number;
  banks: number;
  offers: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    adminApi
      .get("/admin/dashboard")
      .then((res) => setStats(res.data))
      .catch(console.error);
  }, []);

  const cards = [
    {
      label: "Products",
      value: stats?.products ?? "-",
      icon: <CreditCard size={24} />,
      color: "bg-blue-50 text-blue-600",
      link: "/admin/credit-cards",
    },
    {
      label: "Banks",
      value: stats?.banks ?? "-",
      icon: <Building2 size={24} />,
      color: "bg-green-50 text-green-600",
      link: "/admin/banks",
    },
    {
      label: "Active Offers",
      value: stats?.offers ?? "-",
      icon: <Gift size={24} />,
      color: "bg-purple-50 text-purple-600",
      link: "/admin/credit-cards",
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg ${card.color}`}>{card.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
