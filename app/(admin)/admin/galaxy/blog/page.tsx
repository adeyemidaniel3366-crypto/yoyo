"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, BookOpen } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  views: number;
}

const ARTICLES: Article[] = [
  { id: "1", title: "PCIe 4.0 vs PCIe 5.0 SSDs: Real-World Lagos Tech Benchmarks", category: "Hardware Review", date: "15 Nov 2026", views: 1420 },
  { id: "2", title: "How to Build a Redundant Enterprise NAS Server for Nigerian SMEs", category: "Tutorial", date: "08 Nov 2026", views: 980 },
  { id: "3", title: "Apple M3 Max in 2026: Still the King of Mobile Workstations?", category: "Analysis", date: "02 Nov 2026", views: 2150 },
];

export default function GalaxyBlogPage() {
  const [articles] = useState<Article[]>(ARTICLES);

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
            <h1 className="text-2xl font-bold text-heading">Tech Blog &amp; Hardware Guides</h1>
            <SourceBadge source={ServiceSlug.GALAXY} size="sm" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Publish electronics guides, buying advice and technical benchmark articles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("New article writer")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-galaxy text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Tech Article</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted font-semibold">
                <th className="py-2.5">Article Headline</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Published Date</th>
                <th className="py-2.5 text-right">Reader Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-gray-50/70">
                  <td className="py-3 font-bold text-heading">{art.title}</td>
                  <td className="py-3 text-muted">{art.category}</td>
                  <td className="py-3 text-muted">{art.date}</td>
                  <td className="py-3 text-right font-black text-galaxy">{art.views.toLocaleString()} views</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
