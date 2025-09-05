"use client";

import { useCart } from "@/contexts/CartContext";
import { removeFromCart } from "@/lib/cart";
import Image from "next/image";
import Link from "next/link";

export function CartView() {
  const { cart, updateCart, isLoading } = useCart();

  const handleRemove = async (lineId: string) => {
    if (!cart) return;
    try {
      const updatedCart = await removeFromCart(cart.id, lineId);
      updateCart(updatedCart);
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Could not remove item from cart.");
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading your cart...</div>;
  }

  if (!cart || cart.lines.edges.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <Link
          href="/tester-box"
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <ul className="space-y-4">
          {cart.lines.edges.map(({ node: line }) => (
            <li
              key={line.id}
              className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <Image
                src={line.merchandise.product.featuredImage.url}
                alt={
                  line.merchandise.product.featuredImage.altText ||
                  line.merchandise.product.title
                }
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-md"
              />
              <div className="flex-grow">
                <h2 className="font-semibold">
                  {line.merchandise.product.title}
                </h2>
                <p className="text-sm text-gray-600">
                  Quantity: {line.quantity}
                </p>
                <button
                  onClick={() => handleRemove(line.id)}
                  className="text-xs text-gray-500 hover:text-red-500 hover:underline mt-1"
                >
                  Remove
                </button>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: line.merchandise.price.currencyCode,
                  }).format(parseFloat(line.merchandise.price.amount))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-28">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between border-t pt-4 font-bold text-lg">
            <span>Total</span>
            <span>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: cart.cost.totalAmount.currencyCode,
              }).format(parseFloat(cart.cost.totalAmount.amount))}
            </span>
          </div>
          <a
            href={cart.checkoutUrl}
            className="block w-full text-center mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Proceed to Checkout
          </a>
        </div>
      </div>
    </div>
  );
}
