"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  Upload,
  Search,
  ArrowLeft,
  Star,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { ServiceSlug, SERVICE_CONFIG } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { usePlatformStore } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import { NumberInput } from "@/components/ui/number-input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Product {
  id: string;
  source: ServiceSlug;
  sku: string;
  name: string;
  description?: string;
  priceKobo: number;
  costKobo?: number;
  images: string[];
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "LOW_STOCK" | "ARCHIVED";
  totalStock?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  createdAt?: string;
}

// ---------------------------------------------------------------------------
// Mock initial data
// ---------------------------------------------------------------------------
const INITIAL_PRODUCTS: Product[] = [
  { id: "p1", source: ServiceSlug.SPARK, sku: "SAM-990PRO-4TB", name: "Samsung 990 PRO 4TB NVMe SSD", priceKobo: 4800000, costKobo: 3800000, images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200"], status: "ACTIVE", totalStock: 3, isFeatured: true, isNew: false },
  { id: "p2", source: ServiceSlug.SPARK, sku: "APPLE-MBP16-M3MAX", name: "Apple MacBook Pro 16\" M3 Max", priceKobo: 48500000, costKobo: 42000000, images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200"], status: "ACTIVE", totalStock: 1, isFeatured: true, isNew: true },
  { id: "p3", source: ServiceSlug.SPARK, sku: "ZLT-S69M-13360", name: "Zealot S69M Speaker", priceKobo: 120000, costKobo: 80000, images: [], status: "OUT_OF_STOCK", totalStock: 0, isFeatured: false, isNew: false },
  { id: "p4", source: ServiceSlug.GALAXY, sku: "LXR-SL500-2TB", name: "Lexar SL500 Portable SSD 2TB", priceKobo: 2200000, costKobo: 1700000, images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200"], status: "ACTIVE", totalStock: 8, isFeatured: false, isNew: true },
  { id: "p5", source: ServiceSlug.GALAXY, sku: "SYN-RS1221RP", name: "Synology 8 Bay Rackstation RS1221RP+", priceKobo: 24500000, costKobo: 20000000, images: ["https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=200"], status: "ACTIVE", totalStock: 2, isFeatured: true, isNew: false },
  { id: "p6", source: ServiceSlug.BUILDERS, sku: "DAN-CEM-50KG", name: "Dangote Cement 50kg", priceKobo: 980000, costKobo: 820000, images: [], status: "ACTIVE", totalStock: 240, isFeatured: false, isNew: false },
  { id: "p7", source: ServiceSlug.BUILDERS, sku: "IRON-ROD-16MM", name: "Iron Rod 16mm (per length)", priceKobo: 180000, costKobo: 140000, images: [], status: "LOW_STOCK", totalStock: 2, isFeatured: false, isNew: false },
  { id: "p8", source: ServiceSlug.BUILDERS, sku: "BUA-CEM-50KG", name: "BUA Cement 50kg", priceKobo: 950000, costKobo: 790000, images: [], status: "OUT_OF_STOCK", totalStock: 0, isFeatured: false, isNew: false },
];

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------
const TABS = [
  { key: "ALL", label: "All Products" },
  { key: ServiceSlug.SPARK, label: "Zino Spark" },
  { key: ServiceSlug.GALAXY, label: "Device Galaxy" },
  { key: ServiceSlug.BUILDERS, label: "Top Builders" },
  { key: ServiceSlug.APARTMENTS, label: "Apartments" },
  { key: ServiceSlug.BILLSTACKS, label: "Billstacks" },
  { key: ServiceSlug.VISITORS, label: "Visitors" },
];

// ---------------------------------------------------------------------------
// Product Form Modal
// ---------------------------------------------------------------------------
function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Partial<Product> | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const isNew = !product?.id;
  const [form, setForm] = useState<Partial<Product>>({
    source: ServiceSlug.SPARK,
    sku: "",
    name: "",
    description: "",
    priceKobo: 0,
    costKobo: 0,
    images: [],
    status: "ACTIVE",
    isFeatured: false,
    isNew: false,
    createdAt: new Date().toISOString().slice(0, 10),
    ...product,
  });
  const [imageUrl, setImageUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const set = (key: keyof Product, val: any) => {
    setErrorMsg(null);
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSave = () => {
    if (!form.name?.trim() || !form.sku?.trim()) {
      setErrorMsg("Product Name and SKU are required fields.");
      return;
    }
    onSave({
      id: form.id ?? `p_${Date.now()}`,
      source: form.source ?? ServiceSlug.SPARK,
      sku: form.sku ?? "",
      name: form.name ?? "",
      description: form.description ?? "",
      priceKobo: Number(form.priceKobo) || 0,
      costKobo: Number(form.costKobo) || 0,
      images: form.images ?? [],
      status: form.status ?? "ACTIVE",
      totalStock: form.totalStock ?? 0,
      isFeatured: form.isFeatured ?? false,
      isNew: form.isNew ?? false,
      createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
    });
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      set("images", [...(form.images ?? []), imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const removeImage = (idx: number) => {
    set("images", (form.images ?? []).filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-bold text-heading">
            {isNew ? "Add New Product / Service" : `Edit: ${product?.name}`}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-muted hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>{errorMsg}</span>
              <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {/* Service selector (new only) */}
          {isNew && (
            <div>
              <label className="text-xs font-semibold text-heading block mb-1.5">Service / Section</label>
              <select value={form.source} onChange={(e) => set("source", e.target.value as ServiceSlug)}
                className="w-full h-9 px-3 rounded-lg border border-border text-sm text-gray-900 bg-white focus:outline-none focus:border-active">
                <option value={ServiceSlug.SPARK}>Zino Spark</option>
                <option value={ServiceSlug.GALAXY}>Device Galaxy</option>
                <option value={ServiceSlug.BUILDERS}>Top Builders</option>
                <option value={ServiceSlug.APARTMENTS}>Apartments (Room Types)</option>
                <option value={ServiceSlug.BILLSTACKS}>Billstacks (Plans)</option>
                <option value={ServiceSlug.VISITORS}>Visitors</option>
              </select>
            </div>
          )}

          {/* Name + SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-heading block mb-1.5">Product / Service Name *</label>
              <input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Samsung 990 PRO 4TB NVMe SSD"
                className="w-full h-9 px-3 rounded-lg border border-border text-sm text-heading focus:outline-none focus:border-active" />
            </div>
            <div>
              <label className="text-xs font-semibold text-heading block mb-1.5">SKU / Code *</label>
              <input value={form.sku ?? ""} onChange={(e) => set("sku", e.target.value)}
                placeholder="e.g. SAM-990PRO-4TB"
                className="w-full h-9 px-3 rounded-lg border border-border text-sm text-heading focus:outline-none focus:border-active" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-heading block mb-1.5">Description / Label</label>
            <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)}
              rows={2} placeholder="Short product description or label visible on the website..."
              className="w-full px-3 py-2 rounded-lg border border-border text-sm text-heading focus:outline-none focus:border-active resize-none" />
          </div>

          {/* Price + Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-heading block mb-1.5">Selling Price (₦ kobo)</label>
                        <NumberInput
                          value={form.priceKobo ?? 0}
                          onChange={(v) => set("priceKobo", v as number)}
                          placeholder="e.g. 2500000"
                          min={0}
                          step={100}
                          allowNegative={false}
                          allowDecimal={false}
                          prefix="₦"
                        />
              <p className="text-[10px] text-muted mt-0.5">{formatCurrency(Number(form.priceKobo) || 0)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-heading block mb-1.5">Cost Price (₦ kobo)</label>
                        <NumberInput
                          value={form.costKobo ?? 0}
                          onChange={(v) => set("costKobo", v as number)}
                          placeholder="e.g. 2000000"
                          min={0}
                          step={100}
                          allowNegative={false}
                          allowDecimal={false}
                          prefix="₦"
                        />
              <p className="text-[10px] text-muted mt-0.5">{formatCurrency(Number(form.costKobo) || 0)}</p>
            </div>
          </div>

          {/* Status & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-heading block mb-1.5">Status</label>
              <select value={form.status ?? "ACTIVE"} onChange={(e) => set("status", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border text-sm text-gray-900 bg-white focus:outline-none focus:border-active">
                <option value="ACTIVE">Active — visible on website</option>
                <option value="INACTIVE">Inactive — hidden from website</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-heading block mb-1.5">Date Added</label>
              <input type="date" value={form.createdAt ?? new Date().toISOString().slice(0, 10)} onChange={(e) => set("createdAt", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border text-sm text-heading focus:outline-none focus:border-active" />
            </div>
          </div>

          {/* Flags */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured ?? false} onChange={(e) => set("isFeatured", e.target.checked)}
                className="rounded border-border text-active" />
              <span className="text-xs font-semibold text-heading">Featured Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isNew ?? false} onChange={(e) => set("isNew", e.target.checked)}
                className="rounded border-border text-active" />
              <span className="text-xs font-semibold text-heading">Mark as New</span>
            </label>
          </div>

          {/* Images (Drag & Drop from Local Device) */}
          <ImageDropzone
            label="Product / Service Images (Drag & Drop from Local Device)"
            multiple={true}
            values={form.images ?? []}
            onMultipleChange={(urls) => set("images", urls)}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-muted hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-active text-white text-xs font-bold hover:bg-indigo-700 transition-colors">
            <Save className="w-3.5 h-3.5" />
            {isNew ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirm Dialog
// ---------------------------------------------------------------------------
function DeleteDialog({ product, onConfirm, onCancel }: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-heading">Remove Product?</h3>
            <p className="text-xs text-muted">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-xs text-heading mb-5 bg-gray-50 p-3 rounded-lg border border-border">
          <strong>{product.name}</strong> ({product.sku}) will be removed from the{" "}
          <strong>{SERVICE_CONFIG[product.source]?.name}</strong> service.
        </p>
        <div className="flex items-center gap-3 justify-end">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-muted hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors">
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function ProductsManagerPage() {
  const { products: storeProducts, saveProduct, deleteProduct: removeStoreProduct } = usePlatformStore();
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalProduct, setModalProduct] = useState<Partial<Product> | null | undefined>(undefined);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const products: Product[] = useMemo(
    () =>
      storeProducts.map((sp) => ({
        id: sp.id,
        source: sp.source,
        sku: sp.sku,
        name: sp.name,
        description: sp.description || sp.label,
        priceKobo: sp.priceKobo,
        costKobo: sp.costKobo,
        images: sp.images && sp.images.length > 0 ? sp.images : sp.imageUrl ? [sp.imageUrl] : [],
        status: (sp.status === "PROMO" ? "ACTIVE" : sp.status) as Product["status"],
        totalStock: sp.totalStock,
        isFeatured: sp.isFeatured,
        isNew: sp.isNew,
        createdAt: sp.createdAt,
      })),
    [storeProducts]
  );

  // Filter by tab
  const filtered = useMemo(() => {
    let list = products;
    if (activeTab !== "ALL") list = list.filter((p) => p.source === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [products, activeTab, searchQuery]);

  const handleSaveProduct = (p: Product) => {
    saveProduct({
      id: p.id,
      source: p.source,
      sku: p.sku,
      name: p.name,
      label: p.description || "Featured",
      description: p.description || "",
      priceKobo: p.priceKobo,
      costKobo: p.costKobo,
      priceDisplay: formatCurrency(p.priceKobo),
      imageUrl: p.images[0] || "",
      images: p.images,
      status: p.status,
      totalStock: p.totalStock ?? 10,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      createdAt: p.createdAt,
    });
    setModalProduct(undefined);
  };

  const handleDeleteProduct = (p: Product) => {
    removeStoreProduct(p.id);
    setDeleteProduct(null);
  };

  const toggleStatus = (id: string) => {
    const target = storeProducts.find((p) => p.id === id);
    if (!target) return;
    saveProduct({
      ...target,
      status: target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });
  };

  // DataTable columns
  const columns: ColumnDef<Product>[] = [
    {
      key: "image",
      header: "Image",
      cell: (row) =>
        row.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.images[0]} alt={row.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-300" />
          </div>
        ),
    },
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      cell: (row) => <span className="font-mono text-xs text-muted">{row.sku}</span>,
    },
    {
      key: "name",
      header: "Name / Label",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-semibold text-heading text-sm leading-tight">{row.name}</p>
          {row.isFeatured && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold mt-0.5">
              <Star className="w-3 h-3 fill-amber-400" /> Featured
            </span>
          )}
          {row.isNew && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold ml-2 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> New
            </span>
          )}
        </div>
      ),
    },
    {
      key: "priceKobo",
      header: "Price",
      align: "right",
      sortable: true,
      cell: (row) => <span className="font-bold text-heading">{formatCurrency(row.priceKobo)}</span>,
    },
    {
      key: "totalStock",
      header: "Stock",
      align: "center",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          {row.totalStock === 0 && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
          <span className={cn("font-semibold text-sm", row.totalStock === 0 ? "text-rose-600" : (row.totalStock ?? 0) <= 3 ? "text-amber-600" : "text-heading")}>
            {row.totalStock ?? "—"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button type="button" onClick={() => setModalProduct(row)}
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white transition-colors" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => toggleStatus(row.id)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-200 text-muted hover:text-heading transition-colors"
            title={row.status === "ACTIVE" ? "Deactivate" : "Activate"}>
            {row.status === "ACTIVE" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button type="button" onClick={() => setDeleteProduct(row)}
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Counts per service for tabs
  const countFor = (key: string) =>
    key === "ALL" ? products.length : products.filter((p) => p.source === key).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs text-muted hover:text-active flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span className="text-xs text-muted">/</span>
            <span className="text-xs font-semibold text-heading">Products &amp; Services</span>
          </div>
          <h1 className="text-2xl font-bold text-heading tracking-tight">Products &amp; Services Manager</h1>
          <p className="text-xs text-muted mt-0.5">
            Manage all products, services, images, names and labels across all 6 platform sections.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalProduct({})}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-active text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Service Tab Bar */}
      <div className="bg-white rounded-xl border border-border p-1 shadow-2xs">
        <div className="flex overflow-x-auto gap-1 scrollbar-none">
          {TABS.map((tab) => {
            const count = countFor(tab.key);
            const svc = tab.key !== "ALL" ? SERVICE_CONFIG[tab.key as ServiceSlug] : null;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                  activeTab === tab.key
                    ? "bg-active text-white shadow-sm"
                    : "text-muted hover:text-heading hover:bg-gray-50"
                )}
              >
                {svc && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: svc.color }} />
                )}
                <span>{tab.label}</span>
                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold",
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-muted")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Special panels for non-product services */}
      {(activeTab === ServiceSlug.APARTMENTS) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-heading mb-1">Apartments — Room Types &amp; Pricing</h3>
            <p className="text-xs text-muted mb-3">
              Apartment listings are managed as Room Types (not traditional products). Click below to edit room names, images, descriptions, and pricing.
            </p>
            <Link href="/admin/apartments/rooms"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
              Manage Room Types &amp; Pricing →
            </Link>
          </div>
        </div>
      )}

      {(activeTab === ServiceSlug.BILLSTACKS) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-heading mb-1">Billstacks — Service Plans</h3>
            <p className="text-xs text-muted mb-3">
              Billstacks subscription plans are configured in Platform Settings. Use the settings panel to adjust plan names, features, and pricing tiers.
            </p>
            <Link href="/admin/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors">
              Go to Platform Settings →
            </Link>
          </div>
        </div>
      )}

      {(activeTab === ServiceSlug.VISITORS) && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-heading mb-1">Visitor Management — No Physical Products</h3>
            <p className="text-xs text-muted mb-3">
              The Visitor Management system does not have physical products. Manage visitor categories, departments, and designations from the Visitors section.
            </p>
            <Link href="/admin/visitors"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors">
              Go to Visitor Management →
            </Link>
          </div>
        </div>
      )}

      {/* Product DataTable (shown for all tabs including visitors) */}
      <DataTable
        title={`${TABS.find((t) => t.key === activeTab)?.label ?? ""} — ${filtered.length} Products`}
        columns={columns}
        data={filtered}
        showExportButtons={true}
        showSourceColumn={activeTab === "ALL"}
        searchPlaceholder="Search product name, SKU, description..."
        emptyMessage="No products found. Click 'Add New Product' to get started."
        pageSize={10}
        rightAction={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search..."
                className="pl-8 pr-3 h-8 rounded-lg border border-border text-xs text-heading focus:outline-none focus:border-active w-44"
              />
            </div>
          </div>
        }
      />

      {/* Modals */}
      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSave={handleSaveProduct}
        />
      )}

      {deleteProduct && (
        <DeleteDialog
          product={deleteProduct}
          onConfirm={() => handleDeleteProduct(deleteProduct)}
          onCancel={() => setDeleteProduct(null)}
        />
      )}
    </div>
  );
}
