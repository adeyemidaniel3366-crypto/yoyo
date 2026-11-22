"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ExternalLink,
  Check,
  Copy,
  Mail,
  ChevronUp,
  Search,
  Eye,
} from "lucide-react";
import { SceneNavigation } from "@/components/scene/scene-navigation";
import { SceneHeroCenterpiece } from "@/components/scene/scene-hero-centerpiece";
import { SceneCommandPalette } from "@/components/scene/scene-command-palette";
import { SceneProjectModal } from "@/components/scene/scene-project-modal";
import { SceneLagosClock } from "@/components/scene/scene-lagos-clock";
import { SceneContactForm } from "@/components/scene/scene-contact-form";
import { sceneAudio } from "@/components/scene/scene-sound";
import {
  SCENE_ONE_PROFILE,
  SCENE_LIVE_ACTIVITY,
  SCENE_PROJECTS,
  SCENE_INTERNET_PORTALS,
  SceneProject,
} from "@/lib/scene-data";

export default function SceneOneHomePage() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalProject, setActiveModalProject] = useState<SceneProject | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyEmail = () => {
    sceneAudio.playClick();
    navigator.clipboard.writeText(SCENE_ONE_PROFILE.email);
    setCopiedEmail(true);
    sceneAudio.playSuccess();
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const scrollToTop = () => {
    sceneAudio.playClick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categories = [
    { id: "ALL", label: "All Projects" },
    { id: "SOFTWARE_SYSTEM", label: "Software Systems" },
    { id: "ECOMMERCE", label: "E-Commerce" },
    { id: "HOSPITALITY", label: "Hospitality" },
    { id: "FINTECH", label: "FinTech" },
  ];

  const filteredProjects = SCENE_PROJECTS.filter((p) => {
    const matchesCategory =
      selectedCategory === "ALL" ? true : p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.technologies.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-white text-black selection:bg-blue-600 selection:text-white overflow-x-hidden font-sans">
      {/* Global Command Palette */}
      <SceneCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Quick View Project Modal */}
      <SceneProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />

      {/* Clean White, Black & Blue Navigation Bar */}
      <SceneNavigation
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* ─── 01. HERO / INTRODUCTION SECTION ─── */}
      <section
        id="hero"
        className="relative pt-32 pb-20 px-4 sm:px-8 border-b border-slate-200 bg-white"
      >
        {/* Subtle blue radial wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-blue-500/10 blur-[120px] rounded-full"
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Bio & Core Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-900">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Zino company // zino one</span>
              </div>
              <SceneLagosClock />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-black leading-[1.08]">
                Engineering Scalable Software &amp;{" "}
                <span className="text-blue-600">Modern Digital Systems</span>.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                {SCENE_ONE_PROFILE.subhead}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="#projects"
                onClick={() => sceneAudio.playClick()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
              >
                <span>Explore Platforms</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>

              <Link
                href="/login"
                onClick={() => sceneAudio.playClick()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black hover:bg-slate-800 text-white font-semibold text-sm transition-all"
              >
                <span>Operations Sign In</span>
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </Link>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-sm font-medium transition-all cursor-pointer"
                title="Copy direct email address"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-600 font-bold">Email Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Status Pulse */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0 animate-pulse" />
              <div className="space-y-1">
                <span className="font-bold text-blue-600 uppercase tracking-wider block font-mono">
                  Current Status
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {SCENE_LIVE_ACTIVITY.currentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Segmented Photo Collage */}
          <div className="lg:col-span-5 flex justify-center">
            <SceneHeroCenterpiece />
          </div>
        </div>
      </section>

      {/* ─── 02. ABOUT & PHILOSOPHY SECTION ─── */}
      <section id="about" className="py-20 px-4 sm:px-8 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest block">
              About
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Building Reliable Systems with Purpose &amp; Clarity.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Bio Prose (7 cols) */}
            <div className="lg:col-span-7 space-y-5 text-base text-slate-600 leading-relaxed">
              <p className="text-lg font-semibold text-black leading-snug">
                I am <strong className="text-blue-600">Zino company</strong>, a full-stack engineer and digital systems architect based in Lagos, Nigeria.
              </p>
              <p>
                My work centers on building software that operates smoothly under real-world conditions: from multi-tenant retail operations and e-commerce infrastructure to automated financial ledgers and hotel property management.
              </p>
              <p>
                zino one is our central digital home—where all live platforms, client systems, tools, and operations meet in a single accessible space.
              </p>

              {/* Focus Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-sm text-black block">
                    Full-Stack Engineering
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Next.js 14, TypeScript, Prisma ORM, PostgreSQL, robust APIs, and state management.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-sm text-black block">
                    E-Commerce &amp; FinTech
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Paystack integration, automated VAT computation, multi-currency books, and order flows.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics (5 cols) */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {SCENE_ONE_PROFILE.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-center space-y-1.5 transition-colors"
                >
                  <p className="text-3xl sm:text-4xl font-bold text-blue-600 font-mono">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-600 uppercase tracking-wider font-mono">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Impact Highlights Bar */}
          <div className="pt-6 border-t border-slate-200">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-600 block mb-4">
              System Benchmarks &amp; Real-World Scale
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  metric: "₦4.8M+",
                  title: "Peak Daily Checkout",
                  desc: "Device Galaxy automated payment throughput in Lagos.",
                },
                {
                  metric: "162 Routes",
                  title: "Single App Router Core",
                  desc: "Zino One centralized dashboard orchestrating 6 services.",
                },
                {
                  metric: "12 Suites",
                  title: "Real-Time Room Rack",
                  desc: "Zino Apartments automated check-ins and tourism tax math.",
                },
                {
                  metric: "100%",
                  title: "Idempotent Orders",
                  desc: "Paystack & Flutterwave signed webhook validation engine.",
                },
              ].map((b) => (
                <div
                  key={b.title}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 space-y-1.5 transition-colors"
                >
                  <span className="text-lg font-bold font-mono text-blue-600 block">
                    {b.metric}
                  </span>
                  <p className="text-xs font-bold text-black">{b.title}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 03. PRODUCTION SOFTWARE & PLATFORMS (Compact & Fully Clickable) ─── */}
      <section id="projects" className="py-20 px-4 sm:px-8 border-b border-slate-200 bg-slate-50/50">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest block">
                Featured Work
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                Production Software &amp; Platforms.
              </h2>
              <p className="text-sm text-slate-600">
                Click any platform card below to launch the live application directly.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-white border border-slate-200 text-xs font-mono shadow-2xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sceneAudio.playHover();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-slate-600 hover:text-black hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-96 flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="text"
                aria-label="Search production software and platforms"
                placeholder="Search projects by tech (e.g. Next.js, Prisma, POS, VAT)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-14 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-black placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-xs text-slate-500 hover:text-black cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>
                Showing <strong className="text-black">{filteredProjects.length}</strong> of{" "}
                {SCENE_PROJECTS.length} systems
              </span>
            </div>
          </div>

          {/* Compact, Normal-Sized, Fully Clickable Platform Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={project.primaryHref}
                onClick={() => sceneAudio.playClick()}
                className="rounded-2xl bg-white border border-slate-200 hover:border-blue-500 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group focus:outline-none"
              >
                <div>
                  {/* Compact Visual Preview */}
                  <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-600 text-white shadow-sm">
                        {project.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Compact Content */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="font-bold text-sm text-black group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-[11px] text-blue-600 font-medium mt-0.5 truncate">
                        {project.tagline}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compact Footer Bar */}
                <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between gap-2 bg-slate-50/70">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                    <span>Open System</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveModalProject(project);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 hover:text-black transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Specs</span>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 04. DIGITAL PLATFORMS & CONNECTED WEBSITES ─── */}
      <section id="platforms" className="py-20 px-4 sm:px-8 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest block">
              Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Connected Platforms &amp; Client Portals.
            </h2>
            <p className="text-sm text-slate-600">
              Direct access to live client platforms, corporate sales solutions, and partner portals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCENE_INTERNET_PORTALS.map((portal) => (
              <a
                key={portal.id}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sceneAudio.playClick()}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      {portal.badge}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black group-hover:text-blue-600 transition-colors">
                      {portal.title}
                    </h3>
                    <p className="text-xs font-mono text-blue-600 font-semibold mt-0.5">
                      {portal.role}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between text-xs font-mono text-slate-600">
                  <span>Visit Portal</span>
                  <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 05. FOOTER ─── */}
      <footer className="py-10 px-4 sm:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-white border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
              <Image
                src="/logos/zino-logo.png"
                alt="zino one logo"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-slate-700">
              © {new Date().getFullYear()} Zino One · Zino company
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/login" className="hover:text-blue-600 transition-colors">
              Admin Login
            </Link>
            <Link href="/staff/login" className="hover:text-blue-600 transition-colors">
              Staff Portal
            </Link>
            <Link href="/visit" className="hover:text-blue-600 transition-colors">
              Reception Kiosk
            </Link>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
