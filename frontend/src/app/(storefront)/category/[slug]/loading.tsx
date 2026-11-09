import { HeadingSkeleton, LoadingRegion, ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function CategoryLoading() {
  return (
    <LoadingRegion label="Loading category" className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-12">
      <Skeleton className="mb-10 h-56 w-full rounded-3xl sm:h-72" />
      <HeadingSkeleton />
      <ProductGridSkeleton count={6} className="mt-8 lg:grid-cols-3" />
    </LoadingRegion>
  );
}
