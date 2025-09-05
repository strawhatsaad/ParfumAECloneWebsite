"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { addBundleToCart } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

const HeartIcon = ({ isFilled }: { isFilled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill={isFilled ? "black" : "none"}
    viewBox="0 0 24 24"
    stroke="black"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z"
    />
  </svg>
);

type Product = {
  id: string;
  variantId: string;
  title: string;
  featuredImage: { url: string; altText: string };
  brand: string | null;
  fragranceType: string | null;
  gender: string | null;
};
type Filters = {
  brands: string[];
  fragranceTypes: string[];
  genders: string[];
};
type ActiveFilters = {
  brand: string | null;
  fragranceType: string | null;
  gender: string | null;
};

export function TesterBoxBuilder({
  products,
  filters,
  testerBoxVariantId,
}: {
  products: Product[];
  filters: Filters;
  testerBoxVariantId: string;
}) {
  const [bundleItems, setBundleItems] = useState<Product[]>([]);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    brand: null,
    fragranceType: null,
    gender: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isBundleReadyModalOpen, setIsBundleReadyModalOpen] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { cart, updateCart } = useCart();

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        (!activeFilters.brand || product.brand === activeFilters.brand) &&
        (!activeFilters.fragranceType ||
          product.fragranceType === activeFilters.fragranceType) &&
        (!activeFilters.gender || product.gender === activeFilters.gender)
    );
  }, [products, activeFilters]);

  const handleAddToBundle = (product: Product) => {
    if (
      bundleItems.length >= 10 ||
      bundleItems.find((item) => item.id === product.id)
    )
      return;
    const newBundle = [...bundleItems, product];
    setBundleItems(newBundle);
    if (newBundle.length === 10) setIsBundleReadyModalOpen(true);
  };

  const handleRemoveFromBundle = (productId: string) => {
    setBundleItems(bundleItems.filter((item) => item.id !== productId));
    if (isBundleReadyModalOpen) setIsBundleReadyModalOpen(false);
  };

  const handleAddToCart = async () => {
    if (bundleItems.length !== 10) return;
    setIsLoading(true);
    try {
      const newCart = await addBundleToCart(
        cart?.id || null,
        testerBoxVariantId,
        bundleItems
      );
      updateCart(newCart);
      setIsBundleReadyModalOpen(false);
      setBundleItems([]);
      alert("Success! Your Tester Box has been added to the cart.");
    } catch (error) {
      alert("Failed to add bundle to cart.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isBundleFull = bundleItems.length === 10;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">Filters By</h2>
          <div className="space-y-4">
            <FilterGroup
              title="Brand"
              options={filters.brands}
              active={activeFilters.brand}
              setActive={(val) =>
                setActiveFilters({ ...activeFilters, brand: val })
              }
            />
            <FilterGroup
              title="Fragrance Type"
              options={filters.fragranceTypes}
              active={activeFilters.fragranceType}
              setActive={(val) =>
                setActiveFilters({ ...activeFilters, fragranceType: val })
              }
            />
            <FilterGroup
              title="Gender"
              options={filters.genders}
              active={activeFilters.gender}
              setActive={(val) =>
                setActiveFilters({ ...activeFilters, gender: val })
              }
            />
          </div>
          <div className="mt-8 p-4 border rounded-lg bg-white sticky top-28">
            <h3 className="font-bold text-lg">
              Bundle Items ({bundleItems.length}/10)
            </h3>
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {bundleItems.length > 0 ? (
                bundleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex-1 truncate pr-2">{item.title}</span>
                    <button
                      onClick={() => handleRemoveFromBundle(item.id)}
                      className="text-red-500 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Select 10 items to build your bundle.
                </p>
              )}
            </div>
            {bundleItems.length > 0 && (
              <button
                onClick={handleAddToCart}
                disabled={!isBundleFull || isLoading}
                className="w-full mt-4 px-4 py-2 bg-black text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors hover:bg-gray-800"
              >
                {isLoading
                  ? "Adding..."
                  : isBundleFull
                  ? "Add Bundle to Cart"
                  : `Select ${10 - bundleItems.length} more`}
              </button>
            )}
          </div>
        </aside>
        <section className="lg:col-span-3">
          <h1 className="text-3xl font-bold">Tester Box</h1>
          <p className="text-gray-600 mt-2 mb-6">
            Each Tester Box includes 10pcs 5ml perfumes of your choice.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-2 text-center flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative">
                  <Image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    width={200}
                    height={200}
                    className="w-full h-auto aspect-square object-cover rounded-md"
                  />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/70 rounded-full transition-all hover:bg-white hover:scale-110"
                    aria-label="Add to wishlist"
                  >
                    <HeartIcon isFilled={isWishlisted(product.id)} />
                  </button>
                </div>
                <div className="flex-grow flex flex-col justify-between pt-2">
                  <h4 className="text-sm font-semibold mt-2 truncate">
                    {product.title}
                  </h4>
                  <button
                    onClick={() => handleAddToBundle(product)}
                    disabled={bundleItems.some(
                      (item) => item.id === product.id
                    )}
                    className="w-full mt-2 text-sm px-3 py-2 bg-gray-800 text-white rounded-lg disabled:bg-gray-200 disabled:text-gray-500 transition-colors hover:bg-black"
                  >
                    {bundleItems.some((item) => item.id === product.id)
                      ? "Added"
                      : "Add to Bundle"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <AnimatePresence>
        {isBundleReadyModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-50 flex items-end justify-end p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsBundleReadyModalOpen(false)}
          >
            <motion.div
              className="relative bg-white shadow-2xl rounded-xl p-4 w-full max-w-sm"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">Your Tester Box is Ready!</h3>
                <button
                  onClick={() => setIsBundleReadyModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2">
                {bundleItems.map((item) => (
                  <div key={item.id} className="text-center">
                    <Image
                      src={item.featuredImage.url}
                      alt={item.featuredImage.altText || item.title}
                      width={50}
                      height={50}
                      className="w-full aspect-square object-cover rounded-md"
                    />
                    <p className="text-xs mt-1 truncate">{item.title}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full mt-4 px-4 py-2 bg-black text-white rounded-lg disabled:bg-gray-400 transition-colors hover:bg-gray-800"
              >
                {isLoading ? "Adding..." : "Add to Cart"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const FilterGroup = ({
  title,
  options,
  active,
  setActive,
}: {
  title: string;
  options: string[];
  active: string | null;
  setActive: (value: string | null) => void;
}) => {
  if (options.length === 0) return null;
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="flex flex-col items-start space-y-1">
        <button
          onClick={() => setActive(null)}
          className={`text-sm px-3 py-1 rounded-md transition-colors ${
            !active ? "font-bold bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          All
        </button>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => setActive(option)}
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              active === option ? "font-bold bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
