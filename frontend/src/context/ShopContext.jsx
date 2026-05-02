import React from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import { ProductProvider, ProductContext } from './ProductContext';
import { CartProvider, CartContext } from './CartContext';
import { ChatProvider, ChatContext } from './ChatContext';

export { AuthContext, ProductContext, CartContext, ChatContext };

// Internal consumer to aggregate all values into ShopContext
const ShopConsumer = ({ children }) => {
  const auth = React.useContext(AuthContext);
  const product = React.useContext(ProductContext);
  const cart = React.useContext(CartContext);
  const chat = React.useContext(ChatContext);

  const value = {
    ...auth,
    ...product,
    ...cart,
    ...chat,
    isNotAdmin: !auth.user || (auth.user.role !== 'admin' && !auth.user.isAdmin),
    getCheaperAlternatives: (category, currentPrice) => {
      return product.allProducts
        .filter(p => p.category === category && p.price < currentPrice)
        .sort((a, b) => a.price - b.price)
        .slice(0, 3);
    }
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

// Combined ShopContext for backward compatibility and convenience
export const ShopContext = React.createContext();

export const ShopProvider = ({ children }) => {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <ChatProvider>
            <ShopConsumer>{children}</ShopConsumer>
          </ChatProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
};
