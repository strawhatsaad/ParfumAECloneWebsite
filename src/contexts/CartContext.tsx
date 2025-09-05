"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { getCart, ShopifyCart } from "@/lib/cart";

interface ICartContext {
  cart: ShopifyCart | null;
  cartCount: number;
  updateCart: (newCart: ShopifyCart) => void;
  isLoading: boolean;
}

const CartContext = createContext<ICartContext | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once on the client to load the initial cart
  useEffect(() => {
    const initializeCart = async () => {
      const cartId = localStorage.getItem("shopify_cart_id");
      if (cartId) {
        try {
          const cartData = await getCart(cartId);
          setCart(cartData);
        } catch (err) {
          console.error("Failed to fetch initial cart", err);
          localStorage.removeItem("shopify_cart_id"); // Clear invalid cart ID
        }
      }
      setIsLoading(false);
    };
    initializeCart();
  }, []);

  const updateCart = (newCart: ShopifyCart) => {
    localStorage.setItem("shopify_cart_id", newCart.id);
    setCart(newCart);
  };

  const cartCount =
    cart?.lines.edges.reduce((total, line) => total + line.node.quantity, 0) ||
    0;

  return (
    <CartContext.Provider value={{ cart, cartCount, updateCart, isLoading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
