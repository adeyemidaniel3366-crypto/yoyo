"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, CheckCircle2, ArrowLeft, Check, X } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface ProductReview {
  id: string;
  product: string;
  customer: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

const REVIEWS: ProductReview[] = [
  { id: "r1", product: "Samsung 990 PRO 4TB NVMe SSD", customer: "Dr. Babatunde A. (Lekki Phase 1)", rating: 5, comment: "Delivered same day in Lagos. Authentic sealed box, serial number verified online. Highly recommended!", date: "18 Nov 2026", approved: true },
  { id: "r2", product: "Apple MacBook Pro 16\" M3 Max", customer: "Emeka O. (Victoria Island)", rating: 5, comment: "Monster performance. Battery lasts full 18 hours of coding and video editing.", date: "16 Nov 2026", approved: true },
  { id: "r3", product: "Lexar SL500 Portable SSD 2TB", customer: "Kazeem B. (Ikeja)", rating: 5, comment: "Small as a credit card and fast transfer speed. Works seamlessly with my iPhone 15 Pro.", date: "Yesterday", approved: false },
];

export default function GalaxyReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>(REVIEWS);

  const toggleApproval = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: !r.approved } : r))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/galaxy" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Galaxy Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Customer Product Reviews</h1>
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Moderate, approve and feature verified customer testimonials on public gadget cards.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Device Reviewed</th>
                <th className="py-2.5">Customer</th>
                <th className="py-2.5">Rating</th>
                <th className="py-2.5">Feedback Comment</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{r.product}</td>
                  <td className="py-3 text-muted">{r.customer}</td>
                  <td className="py-3">
                    <div className="flex text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-heading max-w-sm">"{r.comment}"</td>
                  <td className="py-3 text-muted">{r.date}</td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {r.approved ? "APPROVED" : "PENDING APPROVAL"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleApproval(r.id)}
                      className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                        r.approved
                          ? "border-border text-muted hover:bg-gray-50"
                          : "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {r.approved ? "Unpublish" : "Approve & Publish"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
