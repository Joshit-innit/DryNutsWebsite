import { cn } from "@/lib/utils";

/** Placeholder block with a moving sheen. Size it with className. */
export function Skeleton({ className, dark = false }: { className?: string; dark?: boolean }) {
  return <div aria-hidden="true" className={cn("skeleton", dark && "skeleton-dark", className)} />;
}

/** Wraps a skeleton layout so screen readers announce one "Loading" instead of many empty boxes. */
export function LoadingRegion({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Same shape as <ProductCard/>: 5:4 photo, title, weights, price row. */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-brand-border/70">
      <Skeleton className="aspect-[5/4] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-5">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-1/2" />
        <div className="mt-1 flex gap-2">
          <Skeleton className="h-8 w-14 rounded-lg" />
          <Skeleton className="h-8 w-14 rounded-lg" />
          <Skeleton className="h-8 w-14 rounded-lg" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <LoadingRegion label="Loading products" className={cn("grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </LoadingRegion>
  );
}

export function ProductDetailSkeleton() {
  return (
    <LoadingRegion label="Loading product" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-5 pt-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 pt-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-9 w-32" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}

/** Page title + subtitle placeholder. */
export function HeadingSkeleton({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton dark={dark} className="h-8 w-64 max-w-full" />
      <Skeleton dark={dark} className="h-4 w-96 max-w-full" />
    </div>
  );
}

export function StatCardsSkeleton({ count = 4, dark = false }: { count?: number; dark?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn("space-y-4 rounded-2xl border p-5", dark ? "border-cmd-border bg-cmd-card" : "border-brand-border bg-white")}>
          <Skeleton dark={dark} className="h-3 w-24" />
          <Skeleton dark={dark} className="h-8 w-32" />
          <Skeleton dark={dark} className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

/** Table rows for use inside an existing <tbody>. */
export function TableRowsSkeleton({ rows = 6, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} aria-hidden="true">
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="p-4">
              <Skeleton className={cn("h-4", c === 0 ? "w-40" : c % 2 ? "w-20" : "w-28")} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** A standalone table card: header strip plus rows. */
export function TableSkeleton({ rows = 6, columns = 5, dark = false }: { rows?: number; columns?: number; dark?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border", dark ? "border-cmd-border bg-cmd-card" : "border-brand-border bg-white")}>
      <div className={cn("flex gap-6 border-b px-4 py-3", dark ? "border-cmd-border" : "border-brand-border")}>
        {Array.from({ length: columns }, (_, c) => (
          <Skeleton key={c} dark={dark} className="h-3 w-20" />
        ))}
      </div>
      <div className={cn("divide-y", dark ? "divide-cmd-border" : "divide-brand-border")}>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex items-center gap-6 px-4 py-4">
            {Array.from({ length: columns }, (_, c) => (
              <Skeleton key={c} dark={dark} className={cn("h-4", c === 0 ? "w-40" : "w-20")} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Admin / ops page: heading, KPI row, chart block, table. */
export function DashboardSkeleton({ label = "Loading dashboard", dark = false }: { label?: string; dark?: boolean }) {
  return (
    <LoadingRegion label={label} className="max-w-7xl space-y-8">
      <HeadingSkeleton dark={dark} />
      <StatCardsSkeleton dark={dark} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton dark={dark} className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton dark={dark} className="h-72 rounded-2xl" />
      </div>
      <TableSkeleton dark={dark} />
    </LoadingRegion>
  );
}

/** Admin list page: heading, toolbar, table. */
export function ListPageSkeleton({ label, columns = 5, rows = 8 }: { label: string; columns?: number; rows?: number }) {
  return (
    <LoadingRegion label={label} className="max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <HeadingSkeleton />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <Skeleton className="h-11 w-full max-w-md rounded-xl" />
      <TableSkeleton columns={columns} rows={rows} />
    </LoadingRegion>
  );
}

/** Customer order detail: header, timeline, items, summary. */
export function OrderDetailSkeleton() {
  return (
    <LoadingRegion label="Loading order" className="mx-auto max-w-4xl space-y-6 py-10">
      <Skeleton className="h-4 w-32" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <HeadingSkeleton />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      <div className="rounded-3xl border border-brand-border bg-white p-6">
        <div className="flex justify-between gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-4 rounded-3xl border border-brand-border bg-white p-6 md:col-span-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-3xl border border-brand-border bg-white p-6">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </LoadingRegion>
  );
}
