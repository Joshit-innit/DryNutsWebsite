import { HeadingSkeleton, LoadingRegion, ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function StorefrontLoading() {
  return (
    <LoadingRegion label="Loading page" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
      <HeadingSkeleton />
      <div className="mt-8 flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <ProductGridSkeleton className="mt-8" />
    </LoadingRegion>
  );
}
