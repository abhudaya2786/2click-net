const CART_KEY = "bs_cart";

export function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function cartCount(items = readCart()) {
  return items.reduce((s, c) => s + (c.qty || 1), 0);
}

export function addToCart(item) {
  const id = item.product_id || item.id;
  const cart = readCart();
  const ex = cart.find((c) => c.product_id === id);
  if (ex) {
    ex.qty += item.qty || 1;
  } else {
    cart.push({
      product_id: id,
      name: item.name,
      price: Number(item.price),
      qty: item.qty || 1,
      unit: item.unit || "unit",
      image: item.image,
      brand: item.brand,
      category: item.category,
      source: item.source || "product",
    });
  }
  writeCart(cart);
  return cart;
}

export function updateCartQty(productId, qty) {
  const cart = readCart().map((c) =>
    c.product_id === productId ? { ...c, qty: Math.max(1, qty) } : c
  );
  writeCart(cart);
  return cart;
}

export function removeFromCart(productId) {
  const cart = readCart().filter((c) => c.product_id !== productId);
  writeCart(cart);
  return cart;
}

export function clearCart() {
  writeCart([]);
}
