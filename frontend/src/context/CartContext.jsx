import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  readCart, addToCart as addItem, removeFromCart, updateCartQty, clearCart, cartCount,
} from "@/lib/cart";

const CartContext = createContext({
  items: [],
  count: 0,
  add: () => {},
  remove: () => {},
  setQty: () => {},
  clear: () => {},
});

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart());

  const sync = useCallback(() => setItems(readCart()), []);

  useEffect(() => {
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, [sync]);

  const add = (item) => {
    addItem(item);
    sync();
  };

  const remove = (productId) => {
    removeFromCart(productId);
    sync();
  };

  const setQty = (productId, qty) => {
    updateCartQty(productId, qty);
    sync();
  };

  const clear = () => {
    clearCart();
    sync();
  };

  return (
    <CartContext.Provider value={{ items, count: cartCount(items), add, remove, setQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
