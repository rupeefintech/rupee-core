import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, LayoutGrid, List, Plus } from "lucide-react";
import AdminLayout from "../layout/AdminLayout";
import { adminApi } from "../utils/adminApi";

interface Card {
  id: number;
  name: string;
  slug: string;
  category?: string;
  network?: string;
  isActive: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  cardImageUrl?: string | null;
  bank: { id: number; name: string; slug: string; logo: string | null } | null;
  annualFee: number;
  offer: { title: string; description?: string } | null;
  features: string[];
}

export default function CreditCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [search, setSearch] = useState("");
  const [bankFilter, setBankFilter] = useState("");
  const [feeFilter, setFeeFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Add Product modal state
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setBankFilter(searchParams.get("bank") || "");
    setFeeFilter(searchParams.get("fee") || "");
  }, []);

  const fetchCards = () => {
    setLoading(true);
    adminApi
      .get("/admin/products?category=credit_card")
      .then((res) => setCards(res.data.products || []))
      .catch((err) => {
        console.error("Failed to fetch cards:", err);
        setCards([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (bankFilter) params.bank = bankFilter;
    if (feeFilter) params.fee = feeFilter;
    setSearchParams(params);
  }, [bankFilter, feeFilter, setSearchParams]);

  const banks = Array.from(new Set(cards.map((c) => c.bank?.name).filter(Boolean))) as string[];

  const filteredCards = cards.filter((card) => {
    if (search && !card.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (bankFilter && card.bank?.name !== bankFilter) return false;
    if (feeFilter === "0" && (card.annualFee || 0) > 0) return false;
    if (feeFilter && feeFilter !== "0" && (card.annualFee || 0) > Number(feeFilter)) return false;
    return true;
  });

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/admin/products/${id}`);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-5">
        {/* Page Header — matches mockup */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "inherit" }}>
            Products
          </h1>
          <Link
            to="/admin/credit-cards/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>

        {/* Search + Filter bar — matches mockup */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            />
          </div>

          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50">
            <SlidersHorizontal size={14} />
            Filter
          </button>

          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCards.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new product.</p>
          </div>
        )}

        {/* ─── Card Grid (2-col like mockup) ─── */}
        {!loading && viewMode === "grid" && filteredCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="p-5">
                  {/* Bank logo */}
                  {card.bank?.logo && (
                    <img
                      src={card.bank.logo}
                      alt={card.bank.name}
                      className="h-8 mb-3 object-contain"
                    />
                  )}

                  {/* Name + Active badge */}
                  <div className="flex items-start justify-between mb-1">
                    <Link
                      to={`/admin/credit-cards/${card.slug}`}
                      className="text-base font-bold text-gray-800 hover:text-blue-600 transition"
                    >
                      {card.name}
                    </Link>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                          card.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {card.isActive ? "Active" : "Inactive"}
                      </span>
                      {card.isFeatured && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">Featured</span>
                      )}
                      {card.isPopular && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">Popular</span>
                      )}
                    </div>
                  </div>

                  {/* Fee */}
                  <p className="text-base font-semibold text-gray-700 mt-1">
                    ₹ {card.annualFee?.toLocaleString("en-IN") || "0"}
                  </p>

                  {/* Offer badge */}
                  {card.offer && (
                    <div className="mt-3 flex items-center gap-1.5 text-sm text-green-700">
                      <span>🎁</span>
                      <span>{card.offer.title}</span>
                    </div>
                  )}
                </div>

                {/* Bottom buttons — Edit | Offers (matching mockup exactly) */}
                <div className="flex border-t border-gray-200">
                  <Link
                    to={`/admin/credit-cards/${card.slug}/edit`}
                    className="flex-1 py-2.5 text-center text-sm font-medium text-gray-600 hover:bg-gray-50 transition border-r border-gray-200"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/admin/credit-cards/${card.slug}`}
                    className="flex-1 py-2.5 text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
                  >
                    Offers
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── List View ─── */}
        {!loading && viewMode === "list" && filteredCards.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Bank</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Annual Fee</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Offer</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => (
                  <tr key={card.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/credit-cards/${card.slug}`}
                        className="font-medium text-gray-800 hover:text-blue-600"
                      >
                        {card.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{card.bank?.name || "-"}</td>
                    <td className="px-4 py-3 text-gray-800">
                      ₹{card.annualFee?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          card.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {card.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                      {card.offer?.title || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/credit-cards/${card.slug}/edit`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(card.id, card.name)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
