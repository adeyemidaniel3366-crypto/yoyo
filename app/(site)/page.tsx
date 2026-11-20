"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Sparkles,
  Command,
  Activity,
  Globe,
  Check,
  Copy,
  Mail,
  ChevronUp,
  Github,
  Laptop,
  Building2,
  ShoppingBag,
  HardHat,
  Receipt,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Search,
  Eye,
  Zap,
  BarChart3,
  SlidersHorizontal,
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


  // Copy email helper
  const handleCopyEmail = () => {
    sceneAudio.playClick();
    navigator.clipboard.writeText(SCENE_ONE_PROFILE.email);
    setCopiedEmail(true);
    sceneAudio.playSuccess();
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Scroll to top helper
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

  // Filter projects by category and real-time search query
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
    <div className="min-h-screen bg-[#FCEFC3] text-[#12110E] selection:bg-[#00CEC8] selection:text-[#12110E] overflow-x-hidden font-sans">
      {/* ─── GLOBAL COMMAND PALETTE ─── */}
      <SceneCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* ─── QUICK VIEW PROJECT MODAL ─── */}
      <SceneProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />

      {/* ─── NAVIGATION BAR ─── */}
      <SceneNavigation
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* ─── 01. HERO / INTRODUCTION SECTION ─── */}
      <section
        id="hero"
        className="relative pt-32 pb-20 px-4 sm:px-8 border-b border-[#12110E]/10"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Bio & Core Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-[#12110E]/10 text-xs font-mono font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00CEC8] animate-pulse" />
                <span>Zino company // zino one</span>
              </div>
              <SceneLagosClock />
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#12110E] leading-[1.08]">
                Engineering Scalable Software &amp;{" "}
                <span className="text-[#EB4203]">Modern Digital Systems</span>.
              </h1>
              <p className="text-base sm:text-lg text-[#12110E]/80 max-w-xl leading-relaxed">
                {SCENE_ONE_PROFILE.subhead}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="#projects"
                onClick={() => sceneAudio.playClick()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EB4203] hover:bg-[#EB4203]/90 text-white font-semibold text-sm transition-all shadow-sm hover:shadow"
              >
                <span>Explore Projects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="#projects"
                onClick={() => sceneAudio.playClick()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#FFF8DC] text-[#12110E] border border-[#12110E]/10 font-semibold text-sm transition-all shadow-sm"
              >
                <span>Our Software Systems</span>
                <ArrowRight className="w-4 h-4 text-[#00CEC8]" />
              </Link>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/60 hover:bg-white text-[#12110E] border border-[#12110E]/10 text-sm font-medium transition-all"
                title="Copy direct email address"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4 text-[#00CEC8]" />
                    <span className="text-[#00CEC8] font-bold">Email Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#12110E]/60" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Status Pulse */}
            <div className="p-4 rounded-2xl bg-white/60 border border-[#12110E]/10 flex items-start gap-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00CEC8] mt-1 shrink-0 animate-ping" />
              <div className="space-y-1">
                <span className="font-bold text-[#12110E] uppercase tracking-wider block font-mono">
                  Current Status
                </span>
                <p className="text-[#12110E]/80 leading-relaxed">
                  {SCENE_LIVE_ACTIVITY.currentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Interactive Hero Centerpiece */}
          <div className="lg:col-span-5 flex justify-center">
            <SceneHeroCenterpiece />
          </div>
        </div>
      </section>

      {/* ─── 02. ABOUT & PHILOSOPHY SECTION ─── */}
      <section id="about" className="py-20 px-4 sm:px-8 border-b border-[#12110E]/10">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono font-bold text-[#EB4203] uppercase tracking-widest block">
              About
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#12110E]">
              Building Reliable Systems with Purpose &amp; Clarity.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Bio Prose (7 cols) */}
            <div className="lg:col-span-7 space-y-5 text-base text-[#12110E]/80 leading-relaxed">
              <p className="text-lg font-semibold text-[#12110E] leading-snug">
                I am <strong className="text-[#12110E]">Zino company</strong>, a full-stack engineer and digital systems architect based in Lagos, Nigeria.
              </p>
              <p>
                My work centers on building software that operates smoothly under real-world conditions: from multi-tenant retail operations and e-commerce infrastructure to automated financial ledgers and hotel property management.
              </p>
              <p>
                zino one is my central digital home—where all live platforms, client systems, tools, and experiments meet in a single accessible space.
              </p>

              {/* Focus Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <div className="p-4 rounded-xl bg-white/70 border border-[#12110E]/10 space-y-1">
                  <span className="font-bold text-sm text-[#12110E] block">
                    Full-Stack Engineering
                  </span>
                  <p className="text-xs text-[#12110E]/70">
                    Next.js 14, TypeScript, Prisma ORM, PostgreSQL, robust APIs, and state management.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/70 border border-[#12110E]/10 space-y-1">
                  <span className="font-bold text-sm text-[#12110E] block">
                    E-Commerce &amp; FinTech
                  </span>
                  <p className="text-xs text-[#12110E]/70">
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
                  className="p-6 rounded-2xl bg-white/80 border border-[#12110E]/10 text-center space-y-1 shadow-sm"
                >
                  <p className="text-3xl sm:text-4xl font-bold text-[#12110E] font-mono">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[#12110E]/60 uppercase tracking-wider font-mono">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Impact Highlights Bar */}
          <div className="pt-6 border-t border-[#12110E]/10">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#EB4203] block mb-4">
              System Benchmarks &amp; Real-World Scale
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  metric: "₦4.8M+",
                  title: "Peak Daily Checkout",
                  desc: "Device Galaxy automated payment throughput in Lagos.",
                  accent: "#00CEC8",
                },
                {
                  metric: "162 Routes",
                  title: "Single App Router Core",
                  desc: "Zino One centralized dashboard orchestrating 6 services.",
                  accent: "#EB4203",
                },
                {
                  metric: "12 Suites",
                  title: "Real-Time Room Rack",
                  desc: "Zino Apartments automated check-ins and tourism tax math.",
                  accent: "#FF9C5F",
                },
                {
                  metric: "100%",
                  title: "Idempotent Orders",
                  desc: "Paystack & Flutterwave signed webhook validation engine.",
                  accent: "#12110E",
                },
              ].map((b) => (
                <div
                  key={b.title}
                  className="p-4 rounded-2xl bg-white/60 border border-[#12110E]/10 space-y-1.5 shadow-2xs hover:bg-white transition-colors"
                >
                  <span
                    className="text-lg font-bold font-mono block"
                    style={{ color: b.accent }}
                  >
                    {b.metric}
                  </span>
                  <p className="text-xs font-bold text-[#12110E]">{b.title}</p>
                  <p className="text-[11px] text-[#12110E]/70 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 03. PROJECTS & SOFTWARE SYSTEMS ─── */}
      <section id="projects" className="py-20 px-4 sm:px-8 border-b border-[#12110E]/10">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#EB4203] uppercase tracking-widest block">
                Featured Work
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#12110E]">
                Production Software &amp; Platforms.
              </h2>
              <p className="text-sm text-[#12110E]/70">
                Explore real software applications engineered for business operations, e-commerce, and logistics.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-white/70 border border-[#12110E]/10 text-xs font-mono">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sceneAudio.playHover();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    selectedCategory === cat.id
                      ? "bg-[#00CEC8] text-[#12110E] font-bold shadow-sm"
                      : "text-[#12110E]/70 hover:text-[#12110E]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar inside projects */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white/60 border border-[#12110E]/10">
            <div className="relative w-full sm:w-96 flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-[#12110E]/40" />
              <input
                type="text"
                placeholder="Search projects by tech (e.g. Next.js, Prisma, POS, VAT)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#12110E]/10 text-xs font-medium text-[#12110E] placeholder:text-[#12110E]/40 focus:outline-none focus:border-[#00CEC8]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-xs text-[#12110E]/40 hover:text-[#12110E]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#12110E]/60">
              <span className="w-2 h-2 rounded-full bg-[#00CEC8]" />
              <span>
                Showing <strong>{filteredProjects.length}</strong> of{" "}
                {SCENE_PROJECTS.length} systems
              </span>
            </div>
          </div>

          {/* Clean Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const statusColor =
                project.status === "ACTIVE_PRODUCTION"
                  ? "bg-[#EB4203]/15 text-[#EB4203] border-[#EB4203]/30"
                  : "bg-[#00CEC8]/20 text-[#12110E] border-[#00CEC8]/40";

              return (
                <div
                  key={project.id}
                  className="rounded-2xl bg-white/80 border border-[#12110E]/10 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Visual Preview */}
                    <div
                      className="relative aspect-[16/10] w-full bg-[#12110E]/5 overflow-hidden cursor-pointer"
                      onClick={() => setActiveModalProject(project)}
                    >
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border backdrop-blur-sm ${statusColor}`}
                        >
                          {project.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Quick view hover overlay pill */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#12110E]/80 text-[#FCEFC3] text-[10px] font-mono backdrop-blur-md">
                          <Eye className="w-3 h-3" /> Quick Look
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-base text-[#12110E] group-hover:text-[#EB4203] transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-[#12110E]/60 font-medium mt-0.5">
                          {project.tagline}
                        </p>
                      </div>

                      <p className="text-xs text-[#12110E]/80 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>

                      {/* Tech stack badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FCEFC3]/80 text-[#12110E]/80 border border-[#12110E]/5"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-5 pt-0 border-t border-[#12110E]/5 mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Link
                        href={project.primaryHref}
                        onClick={() => sceneAudio.playClick()}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EB4203] hover:text-[#EB4203]/80 transition-colors"
                      >
                        <span>Open System</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setActiveModalProject(project)}
                        className="text-xs font-mono text-[#12110E]/60 hover:text-[#12110E] transition-colors"
                      >
                        Specs
                      </button>
                    </div>

                    {project.githubHref && (
                      <a
                        href={project.githubHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#12110E]/60 hover:text-[#12110E] transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Source</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 04. DIGITAL PLATFORMS & CONNECTED WEBSITES ─── */}
      <section id="platforms" className="py-20 px-4 sm:px-8 border-b border-[#12110E]/10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-mono font-bold text-[#EB4203] uppercase tracking-widest block">
              Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#12110E]">
              Connected Platforms &amp; Client Portals.
            </h2>
            <p className="text-sm text-[#12110E]/70">
              Direct access to live client platforms, corporate sales solutions, and engineering repositories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCENE_INTERNET_PORTALS.map((portal) => (
              <a
                key={portal.id}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sceneAudio.playClick()}
                className="p-6 rounded-2xl bg-white/80 border border-[#12110E]/10 hover:border-[#00CEC8] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#FCEFC3] text-[#12110E] font-bold border border-[#12110E]/10">
                      {portal.badge}
                    </span>
                    <ExternalLink className="w-4 h-4 text-[#12110E]/40 group-hover:text-[#EB4203] transition-colors" />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-[#12110E] group-hover:text-[#EB4203] transition-colors">
                      {portal.title}
                    </h3>
                    <p className="text-xs font-mono text-[#00CEC8] font-bold mt-0.5">
                      {portal.role}
                    </p>
                  </div>

                  <p className="text-xs text-[#12110E]/80 leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#12110E]/5 mt-4 flex items-center justify-between text-xs font-mono text-[#12110E]/60">
                  <span>Visit Portal</span>
                  <span className="text-[#EB4203] group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 05. FOOTER & CONTACT ─── */}
      <footer id="contact" className="py-20 px-4 sm:px-8 bg-white/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Contact Pitch & Direct Options (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-[#EB4203] uppercase tracking-widest block">
                  Get in Touch
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#12110E]">
                  Let's Build Something Together.
                </h2>
                <p className="text-sm text-[#12110E]/70 leading-relaxed max-w-lg">
                  Open for enterprise systems engineering, technical architecture consulting, and high-performance software builds.
                </p>
              </div>

              {/* Direct Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${SCENE_ONE_PROFILE.email}`}
                  onClick={() => sceneAudio.playClick()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EB4203] hover:bg-[#EB4203]/90 text-white font-semibold text-xs transition-all shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Email</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-[#12110E]/10 hover:bg-[#FCEFC3] text-[#12110E] font-medium text-xs transition-all"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00CEC8]" />
                      <span className="text-[#00CEC8] font-bold">Email Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#12110E]/60" />
                      <span>{SCENE_ONE_PROFILE.email}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Availability Note */}
              <div className="p-4 rounded-2xl bg-white/70 border border-[#12110E]/10 text-xs font-mono space-y-1 text-[#12110E]/80">
                <div className="flex items-center gap-2 font-bold text-[#12110E]">
                  <span className="w-2 h-2 rounded-full bg-[#00CEC8]" />
                  <span>CURRENT AVAILABILITY</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Available for select venture projects, architecture contracts, and engineering leadership.
                </p>
              </div>
            </div>

            {/* Right: Interactive Direct Message Form (6 cols) */}
            <div className="lg:col-span-6">
              <SceneContactForm />
            </div>
          </div>

          {/* Bottom Copyright and Links */}
          <div className="pt-8 border-t border-[#12110E]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#12110E]/60">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-white border border-[#12110E]/15 p-0.5 flex items-center justify-center overflow-hidden">
                <Image
                  src="/logos/zino-logo.png"
                  alt="zino one logo"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
              <span>zino one © 2026 Zino company. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/adeyemiZino3366-crypto"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#12110E] transition-colors"
              >
                GitHub
              </a>
              <a
                href={`mailto:${SCENE_ONE_PROFILE.email}`}
                className="hover:text-[#12110E] transition-colors"
              >
                Email
              </a>
              <Link href="/login" className="hover:text-[#12110E] transition-colors">
                Staff Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING BACK TO TOP BUTTON ─── */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-white/90 hover:bg-white text-[#12110E] border border-[#12110E]/15 shadow-lg transition-all hover:scale-105 active:scale-95 animate-in fade-in"
          aria-label="Back to top"
          title="Back to top"
        >
          <ChevronUp className="w-5 h-5 text-[#EB4203]" />
        </button>
      )}
    </div>
  );
}
