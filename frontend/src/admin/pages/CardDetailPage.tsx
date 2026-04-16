import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, RotateCcw } from "lucide-react";
import AdminLayout from "../layout/AdminLayout";
import { adminApi } from "../utils/adminApi";

interface Offer {
  id: number;
  title: string;
  description: string | null;
  rewardRate: number | null;
  rewardCap: number | null;
  category: string | null;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  version: number;
}

interface CardDetail {
  id: number;
  name: string;
  slug: string;
  category: string;
  network: string | null;
  isActive: boolean;
  cardImageUrl: string | null;
  applyUrl: string | null;
  isFeatured: boolean;
  isPopular: boolean;
  rating: number | null;
  totalRatings: number;
  bank: { id: number; name: string; slug: string; logo: string | null };
  details: {
    annualFee: number | null;
    joiningFee: number | null;
    minIncome: number | null;
    loungeAccess: number | null;
    rewardType: string | null;
  };
  offers: Offer[];
  features: { id: number; name: string }[];
}

type Tab = "overview" | "details" | "features" | "offers" | "versioning";

export default function CardDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [card, setCard] = useState<CardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("offers");

  // Offer selections (checkboxes)
  const [selectedOfferIds, setSelectedOfferIds] = useState<Set<number>>(new Set());

  // Offer form
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    rewardRate: "",
    rewardCap: "",
    category: "",
    validFrom: "",
    validTo: "",
  });

  const reloadCard = async () => {
    const res = await adminApi.get(`/admin/credit-cards/${slug}`);
    setCard(res.data);
  };

  useEffect(() => {
    if (!slug) {
      setError("Invalid card slug.");
      setLoading(false);
      return;
    }
    setLoading(true);
    adminApi
      .get(`/admin/credit-cards/${slug}`)
      .then((res) => setCard(res.data))
      .catch(() => setError("Failed to fetch card details."))
      .finally(() => setLoading(false));
  }, [slug]);

  // Offer CRUD
  const handleAddOffer = async () => {
    if (!card || !offerForm.title.trim()) return;
    try {
      await adminApi.post(`/admin/products/${card.id}/offers`, {
        title: offerForm.title,
        description: offerForm.description || null,
        rewardRate: offerForm.rewardRate ? Number(offerForm.rewardRate) : null,
        rewardCap: offerForm.rewardCap ? Number(offerForm.rewardCap) : null,
        category: offerForm.category || null,
        validFrom: offerForm.validFrom || null,
        validTo: offerForm.validTo || null,
      });
      await reloadCard();
      resetOfferForm();
    } catch {
      alert("Failed to add offer.");
    }
  };

  const handleEditOffer = async () => {
    if (!editingOfferId || !offerForm.title.trim()) return;
    try {
      await adminApi.put(`/admin/offers/${editingOfferId}`, {
        title: offerForm.title,
        description: offerForm.description || null,
        rewardRate: offerForm.rewardRate ? Number(offerForm.rewardRate) : null,
        rewardCap: offerForm.rewardCap ? Number(offerForm.rewardCap) : null,
        category: offerForm.category || null,
        validFrom: offerForm.validFrom || null,
        validTo: offerForm.validTo || null,
      });
      await reloadCard();
      resetOfferForm();
    } catch (err: any) {
      console.error("Update offer failed:", err.response?.status, err.response?.data);
      alert(`Failed to update offer: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDeleteOffer = async (offerId: number) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await adminApi.delete(`/admin/offers/${offerId}`);
      await reloadCard();
    } catch {
      alert("Failed to delete offer.");
    }
  };

  const handleRevertOffer = async (offerId: number) => {
    if (!confirm("Revert to this version? Current active offer will be deactivated.")) return;
    try {
      await adminApi.post(`/admin/offers/${offerId}/revert`);
      await reloadCard();
    } catch {
      alert("Failed to revert offer.");
    }
  };

  const startEditOffer = (offer: Offer) => {
    setEditingOfferId(offer.id);
    setOfferForm({
      title: offer.title,
      description: offer.description || "",
      rewardRate: offer.rewardRate?.toString() || "",
      rewardCap: offer.rewardCap?.toString() || "",
      category: offer.category || "",
      validFrom: offer.validFrom ? offer.validFrom.split("T")[0] : "",
      validTo: offer.validTo ? offer.validTo.split("T")[0] : "",
    });
    setShowOfferForm(true);
  };

  const resetOfferForm = () => {
    setShowOfferForm(false);
    setEditingOfferId(null);
    setOfferForm({ title: "", description: "", rewardRate: "", rewardCap: "", category: "", validFrom: "", validTo: "" });
  };

  const toggleOfferSelect = (id: number) => {
    setSelectedOfferIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Loading / error states
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }
  if (error || !card) {
    return (
      <AdminLayout>
        <div className="py-20 text-center">
          <p className="text-red-600 text-lg">{error || "Card not found."}</p>
          <button onClick={() => navigate("/admin/credit-cards")} className="mt-4 text-blue-600 hover:underline">
            Back to Products
          </button>
        </div>
      </AdminLayout>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "details", label: "Details" },
    { key: "features", label: "Features" },
    { key: "offers", label: "Offers" },
    { key: "versioning", label: "Versioning" },
  ];

  const activeOffers = card.offers.filter((o) => o.isActive);
  const allOffersSorted = [...card.offers].sort((a, b) => b.version - a.version);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-5">
        {/* Breadcrumb */}
        <Link
          to="/admin/credit-cards"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 w-fit"
        >
          <ArrowLeft size={14} />
          Back to Products
        </Link>

        {/* ─── Card Header (matches bottom-right mockup) ─── */}
        <div className="flex items-start justify-between bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            {card.bank.logo && (
              <img
                src={card.bank.logo}
                alt={card.bank.name}
                className="h-14 w-14 rounded-lg object-contain border border-gray-200 p-1 bg-white"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">{card.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-base font-semibold text-gray-700">
                  ₹ {card.details?.annualFee?.toLocaleString("en-IN") || "0"}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    card.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
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
          </div>
          <button
            onClick={() => {
              resetOfferForm();
              setShowOfferForm(true);
              setActiveTab("offers");
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={14} />
            Add Offer
          </button>
        </div>

        {/* ─── Tabs ─── */}
        <div className="border-b border-gray-200 bg-white rounded-t-lg px-1">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Tab Content ─── */}

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow label="Product Name" value={card.name} />
              <InfoRow label="Slug" value={card.slug} />
              <InfoRow label="Bank" value={card.bank.name} />
              <InfoRow label="Category" value={card.category} />
              <InfoRow label="Network" value={card.network || "N/A"} />
              <InfoRow label="Status" value={card.isActive ? "Active" : "Inactive"} />
              <InfoRow label="Annual Fee" value={`₹${card.details?.annualFee?.toLocaleString("en-IN") || "0"}`} />
              <InfoRow label="Joining Fee" value={`₹${card.details?.joiningFee?.toLocaleString("en-IN") || "0"}`} />
              <InfoRow label="Rating" value={card.rating ? `${card.rating} / 5 (${card.totalRatings} ratings)` : "N/A"} />
              <InfoRow label="Featured" value={card.isFeatured ? "Yes" : "No"} />
              <InfoRow label="Popular" value={card.isPopular ? "Yes" : "No"} />
              <InfoRow label="Apply URL" value={card.applyUrl || "N/A"} />
            </div>
            {card.cardImageUrl && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Card Image</p>
                <img src={card.cardImageUrl} alt={card.name} className="h-40 rounded-lg object-contain border border-gray-200 p-2" />
              </div>
            )}
          </div>
        )}

        {/* Details */}
        {activeTab === "details" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow label="Annual Fee" value={`₹${card.details?.annualFee?.toLocaleString("en-IN") || "0"}`} />
              <InfoRow label="Joining Fee" value={`₹${card.details?.joiningFee?.toLocaleString("en-IN") || "0"}`} />
              <InfoRow label="Min Income" value={card.details?.minIncome ? `₹${card.details?.minIncome.toLocaleString("en-IN")}` : "N/A"} />
              <InfoRow label="Lounge Access" value={card.details?.loungeAccess ? `${card.details?.loungeAccess} visits/year` : "No"} />
              <InfoRow label="Reward Type" value={card.details?.rewardType || "N/A"} />
            </div>
          </div>
        )}

        {/* Features */}
        {activeTab === "features" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {card.features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {card.features.map((f) => (
                  <span key={f.id} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {f.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No features tagged.</p>
            )}
          </div>
        )}

        {/* ─── Offers Tab (matches mockup: table with checkboxes + versioning below) ─── */}
        {activeTab === "offers" && (
          <>
            {/* Offer Form (inline) */}
            {showOfferForm && (
              <div className="bg-white rounded-xl border border-blue-200 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  {editingOfferId ? "Edit Offer" : "New Offer"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title *</label>
                    <input
                      value={offerForm.title}
                      onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      placeholder="e.g., shopping, travel, fuel"
                      value={offerForm.category}
                      onChange={(e) => setOfferForm({ ...offerForm, category: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reward Rate (%)</label>
                    <input
                      type="number"
                      value={offerForm.rewardRate}
                      onChange={(e) => setOfferForm({ ...offerForm, rewardRate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reward Cap (₹)</label>
                    <input
                      type="number"
                      value={offerForm.rewardCap}
                      onChange={(e) => setOfferForm({ ...offerForm, rewardCap: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                    <input
                      type="date"
                      value={offerForm.validFrom}
                      onChange={(e) => setOfferForm({ ...offerForm, validFrom: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
                    <input
                      type="date"
                      value={offerForm.validTo}
                      onChange={(e) => setOfferForm({ ...offerForm, validTo: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={offerForm.description}
                      onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                      className="form-input"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={editingOfferId ? handleEditOffer : handleAddOffer}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    {editingOfferId ? "Update Offer" : "Save Offer"}
                  </button>
                  <button
                    onClick={resetOfferForm}
                    className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ─── Offers section (mockup: Offer heading + Add Offer + table with checkboxes) ─── */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">+ Offer</h3>
                <button
                  onClick={() => {
                    resetOfferForm();
                    setShowOfferForm(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={12} />
                  Add Offer
                </button>
              </div>

              {activeOffers.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="w-10 px-4 py-2.5">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={activeOffers.length > 0 && activeOffers.every((o) => selectedOfferIds.has(o.id))}
                          onChange={() => {
                            if (activeOffers.every((o) => selectedOfferIds.has(o.id))) {
                              setSelectedOfferIds(new Set());
                            } else {
                              setSelectedOfferIds(new Set(activeOffers.map((o) => o.id)));
                            }
                          }}
                        />
                      </th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase">Title</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase">Rate</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase">Valid Until</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase">Cap</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase">Category</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase">Tags</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-500 text-xs uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeOffers.map((offer) => (
                      <tr key={offer.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedOfferIds.has(offer.id)}
                            onChange={() => toggleOfferSelect(offer.id)}
                          />
                        </td>
                        <td className="px-3 py-3 font-medium text-gray-800">{offer.title}</td>
                        <td className="px-3 py-3 text-gray-600">
                          {offer.rewardRate ? `${offer.rewardRate}% Off` : "-"}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {offer.validTo ? new Date(offer.validTo).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {offer.rewardCap ? `₹${offer.rewardCap.toLocaleString("en-IN")}` : "-"}
                        </td>
                        <td className="px-3 py-3">
                          {offer.category ? (
                            <span className="text-xs text-gray-600">{offer.category}</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold">All</span>
                            {offer.category && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">
                                Shared
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEditOffer(offer)}
                              className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(offer.id)}
                              className="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">No active offers.</div>
              )}
            </div>

            {/* ─── Versioning section (shown below offers on same tab, like mockup) ─── */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">+ Versioning</h3>
              </div>

              {allOffersSorted.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="w-10 px-4 py-2.5">
                        <input type="checkbox" className="rounded border-gray-300" disabled />
                      </th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase">Version</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase">Updates</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase">Status</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-500 text-xs uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOffersSorted.map((offer, idx) => (
                      <tr key={offer.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded border-gray-300" disabled />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">Version {offer.version}</span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold">
                                Latest
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {offer.validFrom
                            ? new Date(offer.validFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                            : "Updated"}
                          {offer.description ? ` (${offer.description.substring(0, 20)})` : ""}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              offer.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {offer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!offer.isActive ? (
                            <button
                              onClick={() => handleRevertOffer(offer.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
                            >
                              Revert
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">Current</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">No versions found.</div>
              )}
            </div>
          </>
        )}

        {/* ─── Versioning Tab (standalone) ─── */}
        {activeTab === "versioning" && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Offer Version History</h3>
            </div>
            {allOffersSorted.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {allOffersSorted.map((offer, idx) => (
                  <div key={offer.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800">Version {offer.version}</span>
                      {idx === 0 && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold">
                          Latest
                        </span>
                      )}
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          offer.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {offer.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {offer.validFrom
                          ? new Date(offer.validFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "N/A"}
                      </span>
                      {!offer.isActive ? (
                        <button
                          onClick={() => handleRevertOffer(offer.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50"
                        >
                          <RotateCcw size={12} />
                          Revert
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 px-3">Current</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No offer versions found.</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}
