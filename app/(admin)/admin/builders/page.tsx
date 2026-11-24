"use client";

import React from "react";
import { TopBuildersApp } from "@/components/builders/builders-app";

export default function TopBuildersDashboardPage() {
  return (
    <div className="-m-4 sm:-m-6">
      <TopBuildersApp initialLoggedIn={true} />
    </div>
  );
}
