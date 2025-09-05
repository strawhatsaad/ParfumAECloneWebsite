"use client";

import Link from "next/link";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

const WishlistIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z"
    />
  </svg>
);
const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);

export const Header = () => {
  const { wishlistItems } = useWishlist();
  const { cartCount } = useCart();

  const wishlistCount = wishlistItems.size;

  return (
    <header className="bg-white/80 text-black border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-widest uppercase hover:opacity-75 transition-opacity"
        >
          Parfum AE
        </Link>
        <nav className="hidden md:flex items-center gap-x-2">
          <Link
            href="/"
            className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/tester-box"
            className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Tester
          </Link>
        </nav>
        <div className="flex items-center gap-x-2">
          <Link
            href="/wishlist"
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Wishlist"
          >
            <WishlistIcon />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cart"
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
