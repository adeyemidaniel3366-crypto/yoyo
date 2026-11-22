"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
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
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-black tracking-tight">
          Send a Direct Message
        </h3>
        <p className="text-xs text-slate-600">
          Have an inquiry, project idea, or architectural challenge? Drop a note below.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 space-y-3 text-center">
          <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto" />
          <h4 className="font-bold text-sm text-black">Message Received!</h4>
          <p className="text-xs text-slate-700 max-w-sm mx-auto leading-relaxed">
            Thank you, {name}. Zino will review your note regarding{" "}
            <strong className="text-black">{topic}</strong> and get back to you at{" "}
            <strong className="text-black">{email}</strong>.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setName("");
              setEmail("");
              setMessage("");
            }}
            className="text-xs font-mono font-bold text-blue-600 hover:underline pt-2 block mx-auto cursor-pointer"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic Pills */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
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
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                    topic === t
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
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
              <label
                htmlFor="contact-name"
                className="text-[11px] font-mono text-slate-700 block"
              >
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                placeholder="Zino Adeyemi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-black placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="contact-email"
                className="text-[11px] font-mono text-slate-700 block"
              >
                Your Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-black placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Message Textarea */}
          <div className="space-y-1">
            <label
              htmlFor="contact-message"
              className="text-[11px] font-mono text-slate-700 block"
            >
              Message or Project Brief
            </label>
            <textarea
              id="contact-message"
              rows={3}
              placeholder="Tell me a bit about what you're working on or want to build..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-black placeholder:text-slate-400 focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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
