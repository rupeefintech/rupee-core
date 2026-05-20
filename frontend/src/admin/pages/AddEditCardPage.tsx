import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Bold, Italic, List, ListOrdered, Heading2, Plus, X, Upload } from "lucide-react";
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
  const [loungeAccessNote, setLoungeAccessNote] = useState("");
  const [rewardType, setRewardType] = useState("");
  const [annualFeeWaiver, setAnnualFeeWaiver] = useState("");
  const [joiningFeeWaiver, setJoiningFeeWaiver] = useState("");
  const [forexMarkup, setForexMarkup] = useState("");
  const [apr, setApr] = useState("");
  const [atmCashFee, setAtmCashFee] = useState("");
  const [latePaymentFee, setLatePaymentFee] = useState("");
  const [railwaySurcharge, setRailwaySurcharge] = useState("");
  const [rentPaymentFee, setRentPaymentFee] = useState("");
  const [rewardRedemptionFee, setRewardRedemptionFee] = useState("");

  // Card info
  const [aboutCard, setAboutCard] = useState("");
  const [bestFor, setBestFor] = useState<string[]>([]);

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
          setLoungeAccessNote(c.details.loungeAccessNote || "");
          setRewardType(c.details.rewardType || "");
          setAnnualFeeWaiver(c.details.annualFeeWaiver || "");
          setJoiningFeeWaiver(c.details.joiningFeeWaiver || "");
          setForexMarkup(c.details.forexMarkup != null ? String(c.details.forexMarkup) : "");
          setApr(c.details.apr || "");
          setAtmCashFee(c.details.atmCashFee || "");
          setLatePaymentFee(c.details.latePaymentFee || "");
          setRailwaySurcharge(c.details.railwaySurcharge || "");
          setRentPaymentFee(c.details.rentPaymentFee || "");
          setRewardRedemptionFee(c.details.rewardRedemptionFee || "");
        }
        setAboutCard(c.aboutCard || "");
        setBestFor(c.bestFor ? c.bestFor.split(",").map((s: string) => s.trim()).filter(Boolean) : []);
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
        aboutCard: aboutCard || null,
        bestFor: bestFor.length ? bestFor.join(",") : null,
        details: {
          annualFee: annualFee ? Number(annualFee) : null,
          joiningFee: joiningFee ? Number(joiningFee) : null,
          minIncome: minIncome ? Number(minIncome) : null,
          loungeAccess: loungeAccess ? Number(loungeAccess) : null,
          loungeAccessNote: loungeAccessNote || null,
          rewardType: rewardType || null,
          annualFeeWaiver: annualFeeWaiver || null,
          joiningFeeWaiver: joiningFeeWaiver || null,
          forexMarkup: forexMarkup ? Number(forexMarkup) : null,
          apr: apr || null,
          atmCashFee: atmCashFee || null,
          latePaymentFee: latePaymentFee || null,
          railwaySurcharge: railwaySurcharge || null,
          rentPaymentFee: rentPaymentFee || null,
          rewardRedemptionFee: rewardRedemptionFee || null,
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
              <div>
                <FormField label="Annual Fee (₹) + GST">
                  <input type="number" value={annualFee} onChange={(e) => setAnnualFee(e.target.value)} placeholder="2500" className="form-input" />
                </FormField>
                <input
                  value={annualFeeWaiver}
                  onChange={(e) => setAnnualFeeWaiver(e.target.value)}
                  placeholder="Waiver condition e.g. Waived on ₹4 lakh annual spend"
                  className="form-input mt-1.5 text-xs"
                />
              </div>
              <div>
                <FormField label="Joining Fee (₹) + GST">
                  <input type="number" value={joiningFee} onChange={(e) => setJoiningFee(e.target.value)} placeholder="2500" className="form-input" />
                </FormField>
                <input
                  value={joiningFeeWaiver}
                  onChange={(e) => setJoiningFeeWaiver(e.target.value)}
                  placeholder="Waiver condition e.g. Waived on completing first transaction"
                  className="form-input mt-1.5 text-xs"
                />
              </div>
              <FormField label="Minimum Income (₹)">
                <input
                  type="number"
                  value={minIncome}
                  onChange={(e) => setMinIncome(e.target.value)}
                  placeholder="300000"
                  className="form-input"
                />
              </FormField>
              <FormField label="Lounge Access (visits/year — leave blank if unlimited)">
                <input
                  type="number"
                  value={loungeAccess}
                  onChange={(e) => setLoungeAccess(e.target.value)}
                  placeholder="e.g. 8 — or blank for unlimited"
                  className="form-input"
                />
              </FormField>
              <FormField label="Lounge Access Details">
                <input
                  value={loungeAccessNote}
                  onChange={(e) => setLoungeAccessNote(e.target.value)}
                  placeholder="e.g. Unlimited access to 1300+ lounges in India &amp; abroad"
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

              {/* ── Fee Structure ── */}
              <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-1">
                <p className="text-sm font-semibold text-gray-700 mb-3">Fee Structure</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Forex Markup (%)">
                    <input type="number" step="0.01" value={forexMarkup} onChange={(e) => setForexMarkup(e.target.value)} placeholder="e.g. 2.0" className="form-input" />
                  </FormField>
                  <FormField label="APR / Finance Charge">
                    <input value={apr} onChange={(e) => setApr(e.target.value)} placeholder="e.g. 1.99% per month" className="form-input" />
                  </FormField>
                  <FormField label="ATM Cash Withdrawal Fee">
                    <input value={atmCashFee} onChange={(e) => setAtmCashFee(e.target.value)} placeholder="e.g. 2.5% or ₹500 whichever higher" className="form-input" />
                  </FormField>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">Late Payment Fee</label>
                      <button
                        type="button"
                        onClick={() => setLatePaymentFee(JSON.stringify([
                          {"from":0,"to":100,"label":"₹0 – ₹100","fee":0},
                          {"from":101,"to":500,"label":"₹101 – ₹500","fee":100},
                          {"from":501,"to":1000,"label":"₹501 – ₹1,000","fee":500},
                          {"from":1001,"to":5000,"label":"₹1,001 – ₹5,000","fee":600},
                          {"from":5001,"to":10000,"label":"₹5,001 – ₹10,000","fee":750},
                          {"from":10001,"to":25000,"label":"₹10,001 – ₹25,000","fee":900},
                          {"from":25001,"to":50000,"label":"₹25,001 – ₹50,000","fee":1100},
                          {"from":50001,"to":null,"label":"₹50,000 and above","fee":1300}
                        ]))}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >Load standard slabs template</button>
                    </div>
                    <textarea
                      value={latePaymentFee}
                      onChange={(e) => setLatePaymentFee(e.target.value)}
                      rows={4}
                      placeholder={'Plain text OR JSON array: [{"label":"₹0-₹100","fee":0},{"label":"₹101-₹500","fee":100},...]'}
                      className="form-input w-full font-mono text-xs"
                    />
                  </div>
                  <FormField label="Railway Surcharge">
                    <input value={railwaySurcharge} onChange={(e) => setRailwaySurcharge(e.target.value)} placeholder="e.g. 1% + GST" className="form-input" />
                  </FormField>
                  <FormField label="Rent Payment Fee">
                    <input value={rentPaymentFee} onChange={(e) => setRentPaymentFee(e.target.value)} placeholder="e.g. 1% + GST" className="form-input" />
                  </FormField>
                  <FormField label="Reward Redemption Fee">
                    <input value={rewardRedemptionFee} onChange={(e) => setRewardRedemptionFee(e.target.value)} placeholder="e.g. N/A or ₹99 per redemption" className="form-input" />
                  </FormField>
                </div>
              </div>

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
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Popular</span>
                </label>
              </div>

              {/* Best For */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Best For <span className="text-gray-400 font-normal text-xs">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {['Shopping','Online Food Ordering','Dining','Travel','Fuel','Entertainment','Lounge Access','International Spending','Cashback','Rewards/Points','Lifestyle','Premium','Golf'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setBestFor(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      className={`px-3 py-1 text-xs rounded-full border font-medium transition ${bestFor.includes(tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
                    >{tag}</button>
                  ))}
                </div>
              </div>

              {/* About Card */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">About This Card</label>
                <textarea
                  value={aboutCard}
                  onChange={(e) => setAboutCard(e.target.value)}
                  rows={4}
                  placeholder="Describe the card's value proposition, who it's best for, key benefits summary..."
                  className="form-input w-full"
                />
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
              {/* Guidance */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 space-y-1">
                <p className="font-semibold">How to structure benefits (one offer per benefit sub-section):</p>
                <p>• <strong>Category</strong> = main section: <code>Welcome</code>, <code>Travel</code>, <code>Lounge</code>, <code>Dining</code>, <code>Shopping</code>, <code>Fuel</code>, <code>Entertainment</code>, <code>Insurance</code>, <code>Milestone</code>, <code>Rewards</code></p>
                <p>• <strong>Title</strong> = sub-benefit name: "Flight Benefits", "Airport Lounge Access", "Railway Lounge", "Dining Cashback"</p>
                <p>• <strong>Description</strong> = full details with bullets. Use the toolbar for formatting.</p>
                <p>• <strong>Reward Rate / Cap</strong> = fill if it's a cashback/points offer (e.g. 5% / ₹1000)</p>
              </div>
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
                        <select
                          value={offer.category}
                          onChange={(e) => updateOffer(idx, "category", e.target.value)}
                          className="form-input"
                        >
                          <option value="">Select Category</option>
                          <option value="Welcome">Welcome</option>
                          <option value="Travel">Travel</option>
                          <option value="Lounge">Lounge</option>
                          <option value="Dining">Dining</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Fuel">Fuel</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Insurance">Insurance</option>
                          <option value="Milestone">Milestone</option>
                          <option value="Rewards">Rewards</option>
                          <option value="Golf">Golf</option>
                          <option value="Bank Offers">Bank Offers</option>
                        </select>
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
                        <OfferDescriptionEditor
                          value={offer.description}
                          onChange={(v) => updateOffer(idx, "description", v)}
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

function OfferDescriptionEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const applyAction = (fn: (val: string, start: number, end: number) => { text: string; cursor: number }) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const { text, cursor } = fn(value, start, end);
    onChange(text);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const wrapSelection = (before: string, after: string) => applyAction((val, s, e) => {
    const selected = val.slice(s, e) || 'text';
    const text = val.slice(0, s) + before + selected + after + val.slice(e);
    return { text, cursor: s + before.length + selected.length + after.length };
  });

  const prefixLine = (prefix: string) => applyAction((val, s) => {
    const lineStart = val.lastIndexOf('\n', s - 1) + 1;
    const text = val.slice(0, lineStart) + prefix + val.slice(lineStart);
    return { text, cursor: s + prefix.length };
  });

  const toHeader = () => applyAction((val, s) => {
    const lineStart = val.lastIndexOf('\n', s - 1) + 1;
    const lineEnd = val.indexOf('\n', s);
    const end = lineEnd === -1 ? val.length : lineEnd;
    const line = val.slice(lineStart, end).toUpperCase();
    const text = val.slice(0, lineStart) + line + val.slice(end);
    return { text, cursor: s };
  });

  const countedBullet = () => applyAction((val, s) => {
    const before = val.slice(0, s);
    const count = (before.match(/^\d+\.\s/gm) || []).length + 1;
    const lineStart = val.lastIndexOf('\n', s - 1) + 1;
    const prefix = `${count}. `;
    const text = val.slice(0, lineStart) + prefix + val.slice(lineStart);
    return { text, cursor: s + prefix.length };
  });

  const ToolBtn = ({ onClick, title, children }: { onClick: () => void; title: string; children: ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex items-center gap-1 px-2 py-1 text-xs rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition"
    >
      {children}
    </button>
  );

  const Sep = () => <div className="w-px h-4 bg-gray-300 mx-0.5 self-center" />;

  return (
    <div className="md:col-span-2 rounded-lg border border-gray-300 overflow-hidden focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        <ToolBtn onClick={() => wrapSelection('**', '**')} title="Bold (wraps in **)">
          <Bold size={13} /><span>Bold</span>
        </ToolBtn>
        <ToolBtn onClick={() => wrapSelection('_', '_')} title="Italic (wraps in _)">
          <Italic size={13} /><span>Italic</span>
        </ToolBtn>
        <Sep />
        <ToolBtn onClick={() => prefixLine('- ')} title="Bullet point">
          <List size={13} /><span>Bullet</span>
        </ToolBtn>
        <ToolBtn onClick={countedBullet} title="Numbered list item">
          <ListOrdered size={13} /><span>Number</span>
        </ToolBtn>
        <Sep />
        <ToolBtn onClick={toHeader} title="Section header (converts line to UPPERCASE)">
          <Heading2 size={13} /><span>Section</span>
        </ToolBtn>
        <Sep />
        <span className="text-[10px] text-gray-400 ml-1">
          Tip: **bold**, _italic_, - bullet, 1. number, ALLCAPS = section header
        </span>
      </div>
      {/* Editor */}
      <textarea
        ref={ref}
        placeholder={"Description — use toolbar or type directly.\n\nExample:\nSECTION HEADER\n- benefit one\n- benefit two\n\n**Important:** some bold note"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm font-mono text-gray-800 bg-white resize-y focus:outline-none min-h-[220px]"
        rows={12}
        spellCheck={false}
      />
    </div>
  );
}
