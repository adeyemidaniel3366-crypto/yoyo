"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, ArrowLeft, Eye, X, CheckCircle2 } from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  views: number;
}

const ARTICLES: Article[] = [];

export default function GalaxyBlogPage() {
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newArt, setNewArt] = useState({
    title: "",
    category: "Hardware Review",
    summary: "",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArt.title.trim()) return;

    const today = new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
    const created: Article = {
      id: `art_${Date.now()}`,
      title: newArt.title.trim(),
      category: newArt.category,
      date: today,
      views: 1,
    };

    setArticles([created, ...articles]);
    setModalOpen(false);
    setNewArt({ title: "", category: "Hardware Review", summary: "" });
    showToast(`Published article "${created.title}" to blog catalog!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold shadow-2xl border border-rose-500/40 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

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
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-galaxy text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-galaxy/10 text-galaxy flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Publish Tech Article</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best NVMe PCIe 4.0 SSDs for PS5 in Nigeria"
                  value={newArt.title}
                  onChange={(e) => setNewArt({ ...newArt, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-galaxy"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={newArt.category}
                  onChange={(e) => setNewArt({ ...newArt, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-galaxy bg-white text-gray-900"
                >
                  <option value="Hardware Review">Hardware Review</option>
                  <option value="IT Infrastructure">IT Infrastructure</option>
                  <option value="Analysis">Industry Analysis</option>
                  <option value="Buyer's Guide">Buyer&apos;s Guide</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Summary / Introduction</label>
                <textarea
                  rows={3}
                  placeholder="Brief synopsis for readers..."
                  value={newArt.summary}
                  onChange={(e) => setNewArt({ ...newArt, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-galaxy resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-galaxy text-white font-bold hover:opacity-95 shadow-sm"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
