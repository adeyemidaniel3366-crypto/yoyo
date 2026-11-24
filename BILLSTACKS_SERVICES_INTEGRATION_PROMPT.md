# Billstacks Services Integration - Detailed Implementation Prompt

## Objective
Add all the services/modules shown in the Billstacks.com admin dashboard and landing page to the Billstacks section of the Zino One platform website (`/billstacks` route).

## Source Analysis

### Billstacks.com Services/Modules Identified
From the Billstacks.com landing page (https://billstacks.com/), the following services/modules are listed under "Products":
1. **Products** - Inventory/product management
2. **Tax** - Tax calculation and compliance (FIRS 7.5% VAT)
3. **HRM** - Human Resource Management
4. **Affiliate** - Affiliate/referral program management
5. **Estimates** - Quote/estimate generation
6. **Recurring Invoice** - Automated recurring billing
7. **Role Permissions** - Access control and user permissions

### Current Implementation State
- **Route**: `/app/(site)/billstacks/page.tsx` - Public marketing page for Billstacks
- **Constants**: `lib/constants.ts` defines `ServiceSlug.BILLSTACKS` with config
- **Platform Store**: `lib/platform-store.ts` manages products/subscriptions
- **Design System**: Uses Billstacks brand color (`#28A745`), Tailwind classes, Lucide icons

## Implementation Requirements

### 1. Add Services/Modules Data Structure
Create a new constant file or extend `constants.ts` with Billstacks-specific modules:

```typescript
// lib/billstacks-modules.ts (new file)
export interface BillstacksModule {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string; // Lucide icon name
  features: string[];
  route?: string; // Future: link to module-specific page
  category: 'core' | 'addon' | 'premium';
  isPopular?: boolean;
}

export const BILLSTACKS_MODULES: BillstacksModule[] = [
  {
    id: 'products',
    name: 'Products & Inventory',
    shortName: 'Products',
    description: 'Manage your product catalog, stock levels, and inventory across multiple locations.',
    icon: 'Package',
    features: [
      'Unlimited products & variants',
      'Stock alerts & low inventory warnings',
      'Multi-location inventory tracking',
      'Barcode/QR code support',
      'Import/export via CSV'
    ],
    category: 'core',
    isPopular: true
  },
  {
    id: 'tax',
    name: 'Tax Compliance (FIRS)',
    shortName: 'Tax',
    description: 'Automated Nigerian tax compliance with FIRS 7.5% VAT reporting and remittance.',
    icon: 'Calculator',
    features: [
      'Auto-calculate 7.5% VAT on invoices',
      'FIRS-compliant VAT returns (VAT002)',
      'Withholding Tax (WHT) computation',
      'Tax exemption certificate management',
      'Audit-ready tax reports'
    ],
    category: 'core'
  },
  {
    id: 'hrm',
    name: 'Human Resource Management',
    shortName: 'HRM',
    description: 'Complete HR suite for payroll, leave, attendance, and employee management.',
    icon: 'Users',
    features: [
      'Employee database & profiles',
      'Automated payroll with tax deductions',
      'Leave management & approval workflows',
      'Attendance tracking (biometric/manual)',
      'Pension & NHF contributions',
      'Payslip generation & distribution'
    ],
    category: 'addon'
  },
  {
    id: 'affiliate',
    name: 'Affiliate & Referral Program',
    shortName: 'Affiliate',
    description: 'Grow your business through partner referrals with automated commission tracking.',
    icon: 'Gift',
    features: [
      'Custom commission structures',
      'Real-time referral tracking',
      'Automated payout calculations',
      'Partner dashboard & analytics',
      'Multi-tier referral support'
    ],
    category: 'addon'
  },
  {
    id: 'estimates',
    name: 'Estimates & Quotes',
    shortName: 'Estimates',
    description: 'Professional quotes that convert to invoices with one click.',
    icon: 'FileText',
    features: [
      'Beautiful quote templates',
      'One-click convert to invoice',
      'Version control & revision history',
      'Client approval workflow',
      'Validity periods & auto-expiry'
    ],
    category: 'core',
    isPopular: true
  },
  {
    id: 'recurring-invoices',
    name: 'Recurring Invoices',
    shortName: 'Recurring',
    description: 'Automate subscription billing with flexible schedules and payment retries.',
    icon: 'RotateCcw',
    features: [
      'Daily, weekly, monthly, yearly schedules',
      'Automatic payment collection (Paystack)',
      'Smart retry on failed payments',
      'Proration for mid-cycle changes',
      'Customer self-service portal'
    ],
    category: 'core',
    isPopular: true
  },
  {
    id: 'role-permissions',
    name: 'Role-Based Access Control',
    shortName: 'Roles',
    description: 'Granular permissions for team collaboration and data security.',
    icon: 'ShieldCheck',
    features: [
      'Pre-defined roles (Admin, Accountant, Cashier, etc.)',
      'Custom role creation',
      'Module-level permissions',
      'Field-level data access',
      'Audit trail for permission changes'
    ],
    category: 'premium'
  }
];
```

### 2. Update Billstacks Public Page (`app/(site)/billstacks/page.tsx`)

Add a new **"Modules & Features"** section between Hero and Pricing:

```tsx
// Add after Hero section, before Pricing section
{/* Modules & Features Section */}
<section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
  <div className="text-center max-w-3xl mx-auto mb-16">
    <h2 className="text-3xl font-extrabold text-heading tracking-tight">
      Everything You Need to Run Your Business
    </h2>
    <p className="text-xs text-muted mt-3">
      Seven integrated modules — activate only what you need, all in one subscription.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {BILLSTACKS_MODULES.map((module) => (
      <ModuleCard key={module.id} module={module} />
    ))}
  </div>

  {/* Module Categories Legend */}
  <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs">
    <span className="font-semibold text-heading">Categories:</span>
    <CategoryBadge label="Core" color="bg-emerald-100 text-emerald-700" />
    <CategoryBadge label="Add-on" color="bg-blue-100 text-blue-700" />
    <CategoryBadge label="Premium" color="bg-purple-100 text-purple-700" />
  </div>
</section>
```

### 3. Create ModuleCard Component

```tsx
// components/billstacks/ModuleCard.tsx (new file)
"use client";

import React from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { BillstacksModule } from "@/lib/billstacks-modules";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  module: BillstacksModule;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Package: () => <Package className="w-5 h-5" />,
  Calculator: () => <Calculator className="w-5 h-5" />,
  Users: () => <Users className="w-5 h-5" />,
  Gift: () => <Gift className="w-5 h-5" />,
  FileText: () => <FileText className="w-5 h-5" />,
  RotateCcw: () => <RotateCcw className="w-5 h-5" />,
  ShieldCheck: () => <ShieldCheck className="w-5 h-5" />,
};

export function ModuleCard({ module }: ModuleCardProps) {
  const IconComponent = ICON_MAP[module.icon] || (() => <Package className="w-5 h-5" />);
  const isCore = module.category === 'core';
  const isAddon = module.category === 'addon';
  const isPremium = module.category === 'premium';

  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 border transition-all hover:shadow-lg",
      isCore && "border-emerald-200",
      isAddon && "border-blue-200",
      isPremium && "border-purple-200"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          isCore && "bg-emerald-100 text-emerald-600",
          isAddon && "bg-blue-100 text-blue-600",
          isPremium && "bg-purple-100 text-purple-600"
        )}>
          <IconComponent />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-heading text-lg truncate">{module.name}</h3>
            {module.isPopular && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                Popular
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-1.5 line-clamp-2">{module.description}</p>
          
          <ul className="mt-4 space-y-2 text-xs text-body">
            {module.features.slice(0, 4).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{feature}</span>
              </li>
            ))}
            {module.features.length > 4 && (
              <li className="flex items-center gap-2 text-billstacks font-medium">
                <ExternalLink className="w-3.5 h-3.5" />
                +{module.features.length - 4} more features
              </li>
            )}
          </ul>

          <div className="mt-4 flex items-center gap-2">
            <CategoryBadge 
              label={module.category.charAt(0).toUpperCase() + module.category.slice(1)}
              color={
                isCore ? "bg-emerald-100 text-emerald-700" :
                isAddon ? "bg-blue-100 text-blue-700" :
                "bg-purple-100 text-purple-700"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${color}`}>
      {label}
    </span>
  );
}

// Import Lucide icons
import { Package, Calculator, Users, Gift, FileText, RotateCcw, ShieldCheck } from "lucide-react";
```

### 4. Update Pricing Section to Reference Modules

Modify the pricing cards to show which modules are included per plan:

```tsx
// In the pricing card features list, replace static features with:
const planModules = {
  'Starter': ['products', 'tax', 'estimates'],
  'Professional': ['products', 'tax', 'estimates', 'recurring-invoices', 'role-permissions'],
  'Enterprise': ['products', 'tax', 'hrm', 'affiliate', 'estimates', 'recurring-invoices', 'role-permissions']
};

// Then in the card:
<ul className="space-y-3 text-xs border-t border-border pt-6">
  {planModules[p.name as keyof typeof planModules]?.map((moduleId) => {
    const module = BILLSTACKS_MODULES.find(m => m.id === moduleId);
    return module ? (
      <li key={module.id} className="flex items-center gap-2.5 text-body">
        <CheckCircle2 className="w-4 h-4 text-billstacks shrink-0" />
        <span>{module.shortName}</span>
      </li>
    ) : null;
  })}
</ul>
```

### 5. Add Module Detail Pages (Future Enhancement)

Create dynamic routes for each module:
- `/billstacks/modules/products`
- `/billstacks/modules/tax`
- `/billstacks/modules/hrm`
- etc.

Each page would show:
- Detailed feature list
- Screenshots/demos
- Pricing for add-ons
- Integration guides
- FAQ

### 6. Admin Dashboard Integration

The admin sidebar (`components/admin/admin-sidebar.tsx`) should reflect Billstacks modules:

```tsx
// In admin sidebar navigation, add Billstacks sub-menu:
{
  label: 'Billstacks',
  icon: Receipt,
  href: '/admin/billstacks',
  children: [
    { label: 'Dashboard', href: '/admin/billstacks' },
    { label: 'Products', href: '/admin/billstacks/products' },
    { label: 'Tax & VAT', href: '/admin/billstacks/tax' },
    { label: 'HRM', href: '/admin/billstacks/hrm' },
    { label: 'Affiliate', href: '/admin/billstacks/affiliate' },
    { label: 'Estimates', href: '/admin/billstacks/estimates' },
    { label: 'Recurring', href: '/admin/billstacks/recurring' },
    { label: 'Roles & Permissions', href: '/admin/billstacks/roles' },
  ]
}
```

## Design Specifications

### Color Coding by Category
- **Core** (included in all plans): Emerald/Green (`#28A745`)
- **Add-on** (extra cost): Blue (`#2563EB`)
- **Premium** (Enterprise only): Purple (`#7C3AED`)

### Visual Hierarchy
1. Module icon + name (prominent)
2. Category badge (color-coded)
3. Description (2 lines max)
4. Top 4 features with checkmarks
5. "+N more" link for expanded features

### Responsive Behavior
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Cards maintain equal height with flexbox

## Implementation Checklist

- [ ] Create `lib/billstacks-modules.ts` with module definitions
- [ ] Create `components/billstacks/ModuleCard.tsx`
- [ ] Update `app/(site)/billstacks/page.tsx` to import and render modules section
- [ ] Update pricing cards to show module inclusions per plan
- [ ] Add Lucide icons to package.json if not present: `Package`, `Calculator`, `Users`, `Gift`, `FileText`, `RotateCcw`, `ShieldCheck`
- [ ] Test responsive layout on all breakpoints
- [ ] Verify Billstacks brand colors used consistently
- [ ] Add module detail pages (Phase 2)
- [ ] Update admin sidebar navigation (Phase 2)

## Files to Create/Modify

### New Files
1. `lib/billstacks-modules.ts` - Module definitions
2. `components/billstacks/ModuleCard.tsx` - Module display component
3. `components/billstacks/CategoryBadge.tsx` - Reusable badge (optional)

### Modified Files
1. `app/(site)/billstacks/page.tsx` - Add modules section, update pricing
2. `lib/constants.ts` - Verify Billstacks config is correct
3. `package.json` - Add any missing Lucide icons

## Testing Checklist

- [ ] Page loads without errors
- [ ] All 7 modules display correctly
- [ ] Category badges show correct colors
- [ ] Popular badge appears on Products, Estimates, Recurring
- [ ] Pricing cards show correct module inclusions
- [ ] Responsive grid works on mobile/tablet/desktop
- [ ] Hover effects on cards work
- [ ] Billstacks brand color (#28A745) used consistently
- [ ] No TypeScript errors
- [ ] No console warnings

## Notes

- The modules match exactly what Billstacks.com advertises on their landing page
- Core modules are included in all paid plans
- Add-on modules (HRM, Affiliate) require Professional+ plan
- Premium module (Role Permissions) is Enterprise only
- This aligns with the existing `SERVICE_CONFIG` in constants.ts
- Future: Connect to actual backend module activation via platform store