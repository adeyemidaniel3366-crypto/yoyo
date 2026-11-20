"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  Tv,
  Wifi,
  Wind,
  Bath,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { formatCurrency } from "@/lib/money";
import {
  ApartmentSuite,
  getApartmentSuites,
  saveApartmentSuite,
  deleteApartmentSuite,
  DEFAULT_APARTMENT_SUITES,
} from "@/lib/apartments-data";
import { usePlatformStore } from "@/lib/platform-store";

export default function ApartmentRoomsPage() {
  const { saveProduct, deleteProduct } = usePlatformStore();
  const [suites, setSuites] = useState<ApartmentSuite[]>(DEFAULT_APARTMENT_SUITES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSuite, setEditingSuite] = useState<ApartmentSuite | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ApartmentSuite["category"]>("2-Bedroom");
  const [nightlyRateNaira, setNightlyRateNaira] = useState("50000");
  const [cautionDepositNaira, setCautionDepositNaira] = useState("20000");
  const [adults, setAdults] = useState(4);
  const [children, setChildren] = useState(2);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [sizeSqm, setSizeSqm] = useState(115);
  const [floor, setFloor] = useState("3rd Floor, West Wing");
  const [view, setView] = useState("Lekki Lagoon & Skyline View");
  const [availableUnits, setAvailableUnits] = useState(4);
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&auto=format&fit=crop&q=80"
  );
  const [description, setDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Sitout",
    "AC",
    "Kitchen",
    "Bath Heater",
    "Fiber WiFi",
    "24/7 Power",
  ]);

  const allAvailableAmenities = [
    "Sitout",
    "AC",
    "Kitchen",
    "Bath Heater",
    "Fiber WiFi",
    "24/7 Power",
    "Smart TV",
    "Free Parking",
    "Housekeeping",
    "Swimming Pool",
    "Gym Access",
    "Washing Machine",
  ];

  const presetImages = [
    {
      label: "Luxury Bedroom",
      url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&auto=format&fit=crop&q=80",
    },
    {
      label: "Modern Studio",
      url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop&q=80",
    },
    {
      label: "Executive Lounge",
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80",
    },
    {
      label: "Deluxe Suite",
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80",
    },
  ];

  const loadSuites = () => {
    setSuites(getApartmentSuites());
  };

  useEffect(() => {
    loadSuites();
    window.addEventListener("zino_apartments_update", loadSuites);
    return () => window.removeEventListener("zino_apartments_update", loadSuites);
  }, []);

  const openCreateModal = () => {
    setEditingSuite(null);
    setName("");
    setCategory("2-Bedroom");
    setNightlyRateNaira("50000");
    setCautionDepositNaira("20000");
    setAdults(4);
    setChildren(2);
    setBedrooms(2);
    setBathrooms(2);
    setSizeSqm(115);
    setFloor("3rd Floor, West Wing");
    setView("Lekki Lagoon & Skyline View");
    setAvailableUnits(4);
    setImageUrl(presetImages[0].url);
    setDescription(
      "Luxury apartment suite featuring private sitout, air conditioning, fully fitted kitchen, and 24/7 generator electricity."
    );
    setSelectedAmenities(["Sitout", "AC", "Kitchen", "Bath Heater", "Fiber WiFi", "24/7 Power"]);
    setIsModalOpen(true);
  };

  const openEditModal = (s: ApartmentSuite) => {
    setEditingSuite(s);
    setName(s.name);
    setCategory(s.category);
    setNightlyRateNaira((s.basePriceKobo / 100).toString());
    setCautionDepositNaira((s.cautionDepositKobo / 100).toString());
    setAdults(s.adults);
    setChildren(s.children);
    setBedrooms(s.bedrooms);
    setBathrooms(s.bathrooms);
    setSizeSqm(s.sizeSqm);
    setFloor(s.floor);
    setView(s.view);
    setAvailableUnits(s.availableUnits);
    setImageUrl(s.image);
    setDescription(s.description);
    setSelectedAmenities(s.amenities);
    setIsModalOpen(true);
  };

  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSaveSuite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rateNum = Number(nightlyRateNaira) || 50000;
    const cautionNum = Number(cautionDepositNaira) || 20000;
    const basePriceKobo = Math.round(rateNum * 100);
    const cautionDepositKobo = Math.round(cautionNum * 100);

    const generatedSlug = editingSuite?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = editingSuite?.id || `apt_${Date.now()}`;

    const newSuite: ApartmentSuite = {
      id,
      slug: generatedSlug,
      name: name.trim(),
      subtitle: `${category} Serviced Living with ${selectedAmenities.slice(0, 3).join(", ")}`,
      category,
      basePriceKobo,
      taxPct: 10,
      cautionDepositKobo,
      adults,
      children,
      bedrooms,
      bathrooms,
      bedType: `${bedrooms} Bed(s) (6x6 King)`,
      sizeSqm,
      floor,
      view,
      image: imageUrl.trim() || presetImages[0].url,
      gallery: [imageUrl.trim() || presetImages[0].url],
      amenities: selectedAmenities,
      description: description.trim(),
      sleepingArrangements: [
        { room: "Master Bedroom", bed: "1 King-Size Bed (6x6)" },
        ...(bedrooms > 1
          ? [{ room: "Second Bedroom", bed: "1 King-Size Bed (6x6)" }]
          : []),
      ],
      rules: [
        "Check-in: From 2:00 PM",
        "Check-out: By 11:00 AM",
        "Non-smoking indoors",
        `Refundable caution deposit of ${formatCurrency(cautionDepositKobo)}`,
      ],
      availableUnits,
      featured: true,
    };

    // Save to apartment storage
    saveApartmentSuite(newSuite);

    // Sync with Unified Platform Store
    saveProduct({
      id: newSuite.id,
      source: ServiceSlug.APARTMENTS,
      sku: newSuite.slug.toUpperCase(),
      name: newSuite.name,
      label: newSuite.subtitle,
      description: newSuite.description,
      priceKobo: newSuite.basePriceKobo,
      imageUrl: newSuite.image,
      capacity: `${adults} Adults`,
      amenities: newSuite.amenities,
      totalStock: availableUnits,
    });

    setIsModalOpen(false);
    setToast(
      editingSuite
        ? `Updated ${newSuite.name}!`
        : `New Suite "${newSuite.name}" published! Live on public booking site.`
    );
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete suite "${name}"?`)) {
      deleteApartmentSuite(id);
      deleteProduct(id);
      setToast(`Deleted ${name}.`);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#14142B] text-white text-xs font-bold shadow-2xl border border-emerald-500/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/apartments"
              className="text-xs text-muted hover:text-active flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Apartments Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">
              Apartment Room Types &amp; Suites
            </h1>
            <SourceBadge source={ServiceSlug.APARTMENTS} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Add, configure, and manage luxury apartment inventory live on the
            public booking portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/apartments"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-white text-heading text-xs font-semibold hover:bg-gray-50 shadow-2xs"
          >
            <span>View Public Booking Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted" />
          </Link>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-apartment text-white text-xs font-bold shadow-sm hover:opacity-95 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Add Apartment Suite</span>
          </button>
        </div>
      </div>

      {/* Suites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suites.map((rt) => (
          <div
            key={rt.id}
            className="bg-white rounded-2xl border border-border p-5 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div>
              <div className="aspect-[16/10] w-full rounded-xl bg-gray-50 overflow-hidden mb-4 border border-border relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rt.image}
                  alt={rt.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono font-bold text-heading shadow-xs">
                  {rt.category}
                </span>
              </div>

              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-heading text-base leading-tight">
                    {rt.name}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {rt.adults} Adults · {rt.availableUnits} Units Available
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black text-sm text-apartment font-mono block">
                    {formatCurrency(rt.basePriceKobo)}
                  </span>
                  <span className="text-[10px] text-muted block font-mono">
                    / night (+10%)
                  </span>
                </div>
              </div>

              <p className="text-xs text-body line-clamp-2 mt-2 leading-relaxed">
                {rt.description}
              </p>

              {/* Amenities */}
              <div className="my-4 pt-3 border-t border-border space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono">
                  Suite Amenities
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {rt.amenities.map((am) => (
                    <span
                      key={am}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-50 border border-border px-2 py-0.5 rounded-md text-heading"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <Link
                href={`/apartments/${rt.slug}`}
                target="_blank"
                className="text-muted hover:text-apartment font-semibold flex items-center gap-1"
              >
                <span>Live Preview</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(rt)}
                  className="p-1.5 rounded-lg border border-border text-muted hover:text-heading hover:bg-gray-50"
                  title="Edit Suite"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(rt.id, rt.name)}
                  className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  title="Delete Suite"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── ADD / EDIT APARTMENT MODAL ─── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-border shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest block">
                  {editingSuite ? "Edit Suite Configuration" : "New Apartment Listing"}
                </span>
                <h3 className="text-xl font-bold text-heading">
                  {editingSuite ? `Edit "${editingSuite.name}"` : "Add Apartment Suite"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-muted hover:text-heading"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSuite} className="space-y-4 text-xs font-mono">
              {/* Suite Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted block">Apartment Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luxury 2-Bedroom Executive Apartment"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:border-apartment font-sans text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted block">Suite Category *</label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ApartmentSuite["category"])
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:border-apartment text-xs"
                  >
                    <option value="Studio">Studio Suite</option>
                    <option value="1-Bedroom">1-Bedroom Suite</option>
                    <option value="2-Bedroom">2-Bedroom Suite</option>
                    <option value="Penthouse">Penthouse Suite</option>
                  </select>
                </div>
              </div>

              {/* Nightly Rate & Caution Deposit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted block">Nightly Rate (₦) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    placeholder="50000"
                    value={nightlyRateNaira}
                    onChange={(e) => setNightlyRateNaira(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:border-apartment text-xs"
                  />
                  <span className="text-[10px] text-muted">
                    Display: {formatCurrency((Number(nightlyRateNaira) || 0) * 100)} / night
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-muted block">
                    Refundable Caution Deposit (₦)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    placeholder="20000"
                    value={cautionDepositNaira}
                    onChange={(e) => setCautionDepositNaira(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:border-apartment text-xs"
                  />
                </div>
              </div>

              {/* Capacities */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-muted block text-[10px]">Adults</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted block text-[10px]">Children</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted block text-[10px]">Bedrooms</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted block text-[10px]">Units In Stock</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={availableUnits}
                    onChange={(e) => setAvailableUnits(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs"
                  />
                </div>
              </div>

              {/* Image URL & Preset Selection */}
              <div className="space-y-1.5">
                <label className="text-muted block">Apartment Image URL *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-gray-50 focus:bg-white text-xs"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] text-muted self-center">Presets:</span>
                  {presetImages.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setImageUrl(p.url)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border ${
                        imageUrl === p.url
                          ? "bg-amber-100 border-amber-500 text-amber-900 font-bold"
                          : "bg-gray-50 border-border text-muted hover:bg-gray-100"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities Checklist */}
              <div className="space-y-1.5">
                <label className="text-muted block">Included Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allAvailableAmenities.map((am) => {
                    const isChecked = selectedAmenities.includes(am);
                    return (
                      <label
                        key={am}
                        onClick={() => handleToggleAmenity(am)}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs select-none transition-colors ${
                          isChecked
                            ? "bg-amber-50 border-amber-500 text-amber-900 font-bold"
                            : "border-border text-muted hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="sr-only"
                        />
                        <Check
                          className={`w-3.5 h-3.5 ${
                            isChecked ? "text-amber-600" : "opacity-0"
                          }`}
                        />
                        <span>{am}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-muted block">Suite Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-gray-50 focus:bg-white font-sans text-xs"
                  placeholder="Describe the suite ambiance, private balcony, luxury features..."
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-muted hover:text-heading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-apartment text-white font-bold text-xs shadow-sm hover:opacity-95"
                >
                  {editingSuite ? "Save Changes" : "Publish Apartment Suite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
