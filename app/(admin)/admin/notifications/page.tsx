"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Calendar,
  UserCheck,
  Receipt,
  Trash2,
  Check,
  ArrowLeft,
} from "lucide-react";
import { ServiceSlug } from "@/lib/constants";
import { SourceBadge } from "@/components/ui/source-badge";

interface NotificationItem {
  id: string;
  source: ServiceSlug;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "ORDER" | "BOOKING" | "ALERT" | "PAYMENT" | "VISITOR";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => (filter === "UNREAD" ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs text-muted hover:text-active flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-heading">Notifications Center</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">
            Real-time platform alerts, orders, guest bookings, payments and system warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-white text-xs font-bold text-heading hover:bg-gray-50 shadow-2xs"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 text-xs font-bold border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "ALL" ? "bg-active text-white" : "text-muted hover:text-heading"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("UNREAD")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "UNREAD" ? "bg-active text-white" : "text-muted hover:text-heading"
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted text-xs">
            No notifications in this filter.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.read
                  ? "bg-white border-border text-gray-700"
                  : "bg-indigo-50/40 border-indigo-200/80 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shrink-0 shadow-2xs">
                  {n.type === "ORDER" && <ShoppingCart className="w-5 h-5 text-galaxy" />}
                  {n.type === "BOOKING" && <Calendar className="w-5 h-5 text-apartment" />}
                  {n.type === "ALERT" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  {n.type === "VISITOR" && <UserCheck className="w-5 h-5 text-visitor" />}
                  {n.type === "PAYMENT" && <Receipt className="w-5 h-5 text-emerald-600" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SourceBadge source={n.source} size="sm" />
                    <h3 className="font-bold text-heading text-xs">{n.title}</h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-muted font-mono">{n.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleRead(n.id)}
                  className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-gray-100"
                  title={n.read ? "Mark as unread" : "Mark as read"}
                >
                  <Check className={`w-4 h-4 ${n.read ? "text-muted" : "text-emerald-600"}`} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteNotification(n.id)}
                  className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
