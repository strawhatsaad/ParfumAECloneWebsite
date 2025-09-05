"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { useEffect, useState } from "react";
import { getProductsByIds } from "@/lib/queries";
import Link from "next/link";
import Image from "next/image";

type WishlistProduct = {
  id: string;
  title: string;
  handle: string;
  featuredImage: { url: string; altText: string };
};

export function WishlistView() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistItems.size === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const productIds = Array.from(wishlistItems);
        const fetchedProducts = await getProductsByIds(productIds);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch wishlist products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlistItems]);

  if (isLoading) {
    return <div className="text-center py-20">Loading your wishlist...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
        <Link
          href="/tester-box"
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Discover Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-lg text-center group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <Link href={`/products/${product.handle}`}>
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                width={300}
                height={300}
                className="w-full h-auto aspect-square object-cover rounded-t-lg"
              />
            </Link>
            <div className="p-4">
              <h2 className="font-semibold truncate">{product.title}</h2>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="text-sm text-gray-500 hover:text-red-500 hover:underline mt-2"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
