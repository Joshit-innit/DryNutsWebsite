import { db } from "@/lib/server/db";
import { getCategoryImages } from "@/lib/product-images";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = db.getProducts();
  const categories = db.getCategories().map((category) => {
    const images = getCategoryImages(category.slug);

    return {
      ...category,
      image: category.image || images[0],
      bannerImage: category.bannerImage || images[0],
      itemCount: products.filter((product) => product.category === category.slug).length,
    };
  });

  return Response.json({ data: categories });
}
