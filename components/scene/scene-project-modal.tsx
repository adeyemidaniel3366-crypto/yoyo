"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  ArrowRight,
  Github,
  CheckCircle2,
  Server,
  Database,
  Layers,
  Cpu,
} from "lucide-react";
import { SceneProject } from "@/lib/scene-data";
import { sceneAudio } from "./scene-sound";

interface SceneProjectModalProps {
  project: SceneProject | null;
  onClose: () => void;
}

export function SceneProjectModal({ project, onClose }: SceneProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      window.addEventListener("keydown", handleKeyDown);
      sceneAudio.playSuccess();
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFFDF5] border border-[#12110E]/15 text-[#12110E] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Image Preview Banner */}
        <div className="relative aspect-[16/9] w-full bg-[#12110E]/5 overflow-hidden">
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => {
              sceneAudio.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#12110E]/70 hover:bg-[#12110E] text-white backdrop-blur-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FCEFC3] text-[#12110E] border border-[#12110E]/15 shadow-sm">
              {project.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#EB4203] uppercase tracking-widest">
              {project.category.replace("_", " ")} // {project.year}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#12110E]">
              {project.name}
            </h2>
            <p className="text-sm text-[#12110E]/70 font-medium">
              {project.tagline}
            </p>
          </div>

          <p className="text-sm text-[#12110E]/85 leading-relaxed">
            {project.description}
          </p>

          {/* Key Metrics / Highlights */}
          {project.metrics && (
            <div className="p-4 rounded-2xl bg-[#FCEFC3]/80 border border-[#12110E]/10 space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#EB4203] block">
                Platform Benchmark &amp; Capacity
              </span>
              <p className="text-xs font-mono font-semibold text-[#12110E]">
                {project.metrics}
              </p>
            </div>
          )}

          {/* Architecture & Tech Stack */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#12110E]/60 block">
              Core Technologies &amp; Architecture
            </span>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full bg-white border border-[#12110E]/10 text-xs font-mono text-[#12110E] shadow-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#12110E]/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href={project.primaryHref}
                onClick={() => {
                  sceneAudio.playClick();
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EB4203] hover:bg-[#EB4203]/90 text-white font-bold text-xs shadow-sm hover:shadow transition-all"
              >
                <span>Launch Live System</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {project.githubHref && (
                <a
                  href={project.githubHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sceneAudio.playClick()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#FCEFC3] border border-[#12110E]/10 text-xs font-mono text-[#12110E] font-medium transition-all"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                sceneAudio.playClick();
                onClose();
              }}
              className="text-xs font-mono text-[#12110E]/60 hover:text-[#12110E] underline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
