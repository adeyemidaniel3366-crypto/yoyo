"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, Sparkles, Mail } from "lucide-react";
import { sceneAudio } from "./scene-sound";

export function SceneContactForm() {
  const [topic, setTopic] = useState("Systems Architecture");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const topics = [
    "Systems Architecture",
    "Hire for Project",
    "E-Commerce & POS",
    "Consulting",
    "Saying Hi",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    sceneAudio.playClick();

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      sceneAudio.playSuccess();
    }, 600);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/80 border border-[#12110E]/10 shadow-sm space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-[#12110E] tracking-tight">
          Send a Direct Message
        </h3>
        <p className="text-xs text-[#12110E]/70">
          Have an inquiry, project idea, or architectural challenge? Drop a note below.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-6 rounded-2xl bg-[#00CEC8]/15 border border-[#00CEC8]/40 space-y-3 text-center animate-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-8 h-8 text-[#00CEC8] mx-auto" />
          <h4 className="font-bold text-sm text-[#12110E]">
            Message Received!
          </h4>
          <p className="text-xs text-[#12110E]/80 max-w-sm mx-auto leading-relaxed">
            Thank you, {name}. Zino will review your note regarding <strong>{topic}</strong> and get back to you at <strong>{email}</strong>.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setName("");
              setEmail("");
              setMessage("");
            }}
            className="text-xs font-mono font-bold text-[#EB4203] hover:underline pt-2 block mx-auto"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic Pills */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#12110E]/60 block">
              Inquiry Topic
            </label>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    sceneAudio.playHover();
                    setTopic(t);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    topic === t
                      ? "bg-[#00CEC8] text-[#12110E] font-bold shadow-sm"
                      : "bg-[#FCEFC3]/80 hover:bg-[#FCEFC3] text-[#12110E]/80 border border-[#12110E]/5"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#12110E]/70 block">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="Zino Adeyemi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#12110E]/15 text-xs text-[#12110E] placeholder:text-[#12110E]/30 focus:outline-none focus:border-[#00CEC8]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#12110E]/70 block">
                Your Email
              </label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#12110E]/15 text-xs text-[#12110E] placeholder:text-[#12110E]/30 focus:outline-none focus:border-[#00CEC8]"
              />
            </div>
          </div>

          {/* Message Textarea */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#12110E]/70 block">
              Message or Project Brief
            </label>
            <textarea
              rows={3}
              placeholder="Tell me a bit about what you're working on or want to build..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#12110E]/15 text-xs text-[#12110E] placeholder:text-[#12110E]/30 focus:outline-none focus:border-[#00CEC8] resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#EB4203] hover:bg-[#EB4203]/90 text-white font-bold text-xs tracking-wide shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Sending note...</span>
            ) : (
              <>
                <span>Send Note to Zino</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
