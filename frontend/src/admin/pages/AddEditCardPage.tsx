import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, X, Upload } from "lucide-react";
import AdminLayout from "../layout/AdminLayout";
import { adminApi } from "../utils/adminApi";

type FormTab = "info" | "details" | "features" | "offers" | "versioning";

interface OfferForm {
  title: string;
  description: string;
  rewardRate: string;
  rewardCap: string;
  category: string;
  validFrom: string;
  validTo: string;
}

interface BankOption {
  id: number;
  name: string;
}

interface FeatureOption {
  id: number;
  name: string;
}

const emptyOffer: OfferForm = {
  title: "",
  description: "",
  rewardRate: "",
  rewardCap: "",
  category: "",
  validFrom: "",
  validTo: "",
};

export default function AddEditCardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(slug);

  const [activeTab, setActiveTab] = useState<FormTab>("info");
  const [saving, setSaving] = useState(false);

  // Dropdown data
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [allFeatures, setAllFeatures] = useState<FeatureOption[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [category, setCategory] = useState("credit_card");
  const [bankId, setBankId] = useState("");
  const [network, setNetwork] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Details
  const [annualFee, setAnnualFee] = useState("");
  const [joiningFee, setJoiningFee] = useState("");
  const [minIncome, setMinIncome] = useState("");
  const [loungeAccess, setLoungeAccess] = useState("");
  const [rewardType, setRewardType] = useState("");

  // New Product fields
  const [cardImageUrl, setCardImageUrl] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [rating, setRating] = useState("");
  const [totalRatings, setTotalRatings] = useState("");

  // Features (selected IDs)
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);

  // Offers
  const [offers, setOffers] = useState<OfferForm[]>([]);

  // Product ID (for edit mode)
  const [productId, setProductId] = useState<number | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);

  const [bankSearch, setBankSearch] = useState("");

  // Fetch features once
  useEffect(() => {
    adminApi.get("/admin/features")
      .then((res) => setAllFeatures(res.data.features || []))
      .catch(console.error);
  }, []);

  // Fetch banks (with search debounce)
  useEffect(() => {
    const params = bankSearch ? `?search=${encodeURIComponent(bankSearch)}` : "";
    adminApi.get(`/admin/banks${params}`)
      .then((res) => setBanks(res.data.banks || []))
      .catch(console.error);
  }, [bankSearch]);

  // Load existing card if editing
  useEffect(() => {
    if (!slug) return;
    if (slug === "new") return;

    setLoadingCard(true);
    adminApi
      .get(`/admin/credit-cards/${slug}`)
      .then((res) => {
        const c = res.data;
        setProductId(c.id);
        setName(c.name || "");
        setFormSlug(c.slug || "");
        setCategory(c.category || "credit_card");
        setBankId(c.bank?.id?.toString() || "");
        setNetwork(c.network || "");
        setIsActive(c.isActive !== false);
        setCardImageUrl(c.cardImageUrl || "");
        setApplyUrl(c.applyUrl || "");
        setIsFeatured(c.isFeatured || false);
        setIsPopular(c.isPopular || false);
        setRating(c.rating != null ? String(c.rating) : "");
        setTotalRatings(c.totalRatings != null ? String(c.totalRatings) : "");
        if (c.details) {
          setAnnualFee(c.details.annualFee != null ? String(c.details.annualFee) : "");
          setJoiningFee(c.details.joiningFee != null ? String(c.details.joiningFee) : "");
          setMinIncome(c.details.minIncome != null ? String(c.details.minIncome) : "");
          setLoungeAccess(c.details.loungeAccess != null ? String(c.details.loungeAccess) : "");
          setRewardType(c.details.rewardType || "");
        }
        if (c.features) {
          setSelectedFeatures(c.features.map((f: any) => f.id));
        }
      })
      .catch((err) => {
        console.error("Edit load failed:", err);
        alert("Failed to load card for editing.");
        navigate("/admin/credit-cards");
      })
      .finally(() => setLoadingCard(false));
  }, [slug, navigate]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode) {
      setFormSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      );
    }
  };

  const toggleFeature = (id: number) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const addOffer = () => setOffers([...offers, { ...emptyOffer }]);

  const updateOffer = (idx: number, field: keyof OfferForm, value: string) => {
    const updated = [...offers];
    updated[idx] = { ...updated[idx], [field]: value };
    setOffers(updated);
  };

  const removeOffer = (idx: number) => setOffers(offers.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!name.trim() || !formSlug.trim() || !bankId) {
      alert("Please fill required fields: Name, Slug, and Bank.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        slug: formSlug,
        category,
        bankId: Number(bankId),
        network: network || null,
        isActive,
        cardImageUrl: cardImageUrl || null,
        applyUrl: applyUrl || null,
        isFeatured,
        isPopular,
        rating: rating ? Number(rating) : null,
        totalRatings: totalRatings ? Number(totalRatings) : 0,
        details: {
          annualFee: annualFee ? Number(annualFee) : null,
          joiningFee: joiningFee ? Number(joiningFee) : null,
          minIncome: minIncome ? Number(minIncome) : null,
          loungeAccess: loungeAccess ? Number(loungeAccess) : null,
          rewardType: rewardType || null,
        },
        featureIds: selectedFeatures,
        offers: isEditMode
          ? undefined
          : offers
              .filter((o) => o.title.trim())
              .map((o) => ({
                title: o.title,
                description: o.description || null,
                rewardRate: o.rewardRate ? Number(o.rewardRate) : null,
                rewardCap: o.rewardCap ? Number(o.rewardCap) : null,
                category: o.category || null,
                validFrom: o.validFrom || null,
                validTo: o.validTo || null,
              })),
      };

      if (isEditMode && productId) {
        await adminApi.put(`/admin/products/${productId}`, payload);
      } else {
        await adminApi.post("/admin/products", payload);
      }
      navigate("/admin/credit-cards");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: FormTab; label: string }[] = [
    { key: "info", label: "Product Info" },
    { key: "details", label: "Details" },
    { key: "features", label: "Features" },
    { key: "offers", label: "Offers" },
    { key: "versioning", label: "Versioning" },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-5">
        {/* Back */}
        <button
          onClick={() => navigate("/admin/credit-cards")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 w-fit"
        >
          <ArrowLeft size={14} />
          Back to Products
        </button>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? "Edit Product" : "Add Product"}
        </h1>

        {/* Tabs (matches mockup: Product Info | Details | Features | Offers | Versioning) */}
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

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* ─── Product Info tab (matches mockup: Name + Description side-by-side, Category, Price/Stock/Status row, Upload Image) ─── */}
          {activeTab === "info" && loadingCard && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          )}
          {activeTab === "info" && !loadingCard && (
            <div className="flex flex-col gap-5">
              {/* Name + Description side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Product Name">
                  <input
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., HDFC Millennia"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Slug">
                  <input
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="hdfc-millennia"
                    className="form-input"
                  />
                </FormField>
              </div>

              {/* Category */}
              <FormField label="Category">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input max-w-xs">
                  <option value="credit_card">Credit Card</option>
                  <option value="loan">Loan</option>
                  <option value="savings_account">Savings Account</option>
                </select>
              </FormField>

              {/* Network / Status / Bank row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField label="Card Network">
                  <select value={network} onChange={(e) => setNetwork(e.target.value)} className="form-input">
                    <option value="">Select Network</option>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                    <option value="Amex">American Express</option>
                    <option value="Diners">Diners Club</option>
                  </select>
                </FormField>

                <FormField label="Status">
                  <select
                    value={isActive ? "active" : "inactive"}
                    onChange={(e) => setIsActive(e.target.value === "active")}
                    className="form-input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </FormField>

                <FormField label="Bank">
                  <input
                    type="text"
                    placeholder="Search bank..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="form-input mb-1"
                  />
                  <select value={bankId} onChange={(e) => setBankId(e.target.value)} className="form-input">
                    <option value="">Select</option>
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Upload Image button (mockup shows this) */}
              <div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
                >
                  <Upload size={16} />
                  Upload Image
                </button>
                <p className="text-xs text-gray-400 mt-1">Card image or logo (optional)</p>
              </div>
            </div>
          )}

          {/* ─── Details tab ─── */}
          {activeTab === "details" && loadingCard && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          )}
          {activeTab === "details" && !loadingCard && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Annual Fee (₹)">
                <input
                  type="number"
                  value={annualFee}
                  onChange={(e) => setAnnualFee(e.target.value)}
                  placeholder="999"
                  className="form-input"
                />
              </FormField>
              <FormField label="Joining Fee (₹)">
                <input
                  type="number"
                  value={joiningFee}
                  onChange={(e) => setJoiningFee(e.target.value)}
                  placeholder="499"
                  className="form-input"
                />
              </FormField>
              <FormField label="Minimum Income (₹)">
                <input
                  type="number"
                  value={minIncome}
                  onChange={(e) => setMinIncome(e.target.value)}
                  placeholder="300000"
                  className="form-input"
                />
              </FormField>
              <FormField label="Lounge Access (visits/year)">
                <input
                  type="number"
                  value={loungeAccess}
                  onChange={(e) => setLoungeAccess(e.target.value)}
                  placeholder="8"
                  className="form-input"
                />
              </FormField>
              <FormField label="Card Network">
                <select value={network} onChange={(e) => setNetwork(e.target.value)} className="form-input">
                  <option value="">Select Network</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="RuPay">RuPay</option>
                  <option value="Amex">American Express</option>
                  <option value="Diners">Diners Club</option>
                </select>
              </FormField>
              <FormField label="Reward Type">
                <select value={rewardType} onChange={(e) => setRewardType(e.target.value)} className="form-input">
                  <option value="">Select Type</option>
                  <option value="cashback">Cashback</option>
                  <option value="points">Reward Points</option>
                  <option value="miles">Air Miles</option>
                </select>
              </FormField>
              <FormField label="Card Image URL">
                <input
                  value={cardImageUrl}
                  onChange={(e) => setCardImageUrl(e.target.value)}
                  placeholder="https://example.com/card.webp"
                  className="form-input"
                />
              </FormField>
              <FormField label="Apply URL">
                <input
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  placeholder="https://bank.com/apply"
                  className="form-input"
                />
              </FormField>
              <FormField label="Rating (0-5)">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="4.5"
                  className="form-input"
                />
              </FormField>
              <FormField label="Total Ratings">
                <input
                  type="number"
                  value={totalRatings}
                  onChange={(e) => setTotalRatings(e.target.value)}
                  placeholder="1200"
                  className="form-input"
                />
              </FormField>
              <div className="md:col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Popular</span>
                </label>
              </div>
            </div>
          )}

          {/* ─── Features tab ─── */}
          {activeTab === "features" && (
            <div>
              <p className="text-sm text-gray-500 mb-4">Select features/tags for this card:</p>
              {allFeatures.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allFeatures.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => toggleFeature(f.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                        selectedFeatures.includes(f.id)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No features available.</p>
              )}
            </div>
          )}

          {/* ─── Offers tab ─── */}
          {activeTab === "offers" && (
            <div className="flex flex-col gap-4">
              {isEditMode ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-3">Offers are managed from the card detail page.</p>
                  <Link
                    to={`/admin/credit-cards/${slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go to Offers
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Add initial offers for this card.</p>
                    <button
                      onClick={addOffer}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus size={14} />
                      Add Offer
                    </button>
                  </div>

                  {offers.map((offer, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => removeOffer(idx)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-sm font-medium text-gray-700 mb-3">Offer #{idx + 1}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          placeholder="Offer Title *"
                          value={offer.title}
                          onChange={(e) => updateOffer(idx, "title", e.target.value)}
                          className="form-input"
                        />
                        <input
                          placeholder="Category"
                          value={offer.category}
                          onChange={(e) => updateOffer(idx, "category", e.target.value)}
                          className="form-input"
                        />
                        <input
                          type="number"
                          placeholder="Reward Rate (%)"
                          value={offer.rewardRate}
                          onChange={(e) => updateOffer(idx, "rewardRate", e.target.value)}
                          className="form-input"
                        />
                        <input
                          type="number"
                          placeholder="Reward Cap (₹)"
                          value={offer.rewardCap}
                          onChange={(e) => updateOffer(idx, "rewardCap", e.target.value)}
                          className="form-input"
                        />
                        <input
                          type="date"
                          value={offer.validFrom}
                          onChange={(e) => updateOffer(idx, "validFrom", e.target.value)}
                          className="form-input"
                        />
                        <input
                          type="date"
                          value={offer.validTo}
                          onChange={(e) => updateOffer(idx, "validTo", e.target.value)}
                          className="form-input"
                        />
                        <textarea
                          placeholder="Description"
                          value={offer.description}
                          onChange={(e) => updateOffer(idx, "description", e.target.value)}
                          className="form-input md:col-span-2"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}

                  {offers.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-6">
                      No offers added yet. You can add them after creation too.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── Versioning tab ─── */}
          {activeTab === "versioning" && (
            <div className="text-center py-8">
              {isEditMode ? (
                <>
                  <p className="text-gray-500 mb-3">Version history is on the card detail page.</p>
                  <Link
                    to={`/admin/credit-cards/${slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Versions
                  </Link>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Versioning will be available after creation.</p>
              )}
            </div>
          )}
        </div>

        {/* ─── Action Buttons (matches mockup: Save Changes + Cancel) ─── */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => navigate("/admin/credit-cards")}
            className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
