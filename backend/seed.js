const mongoose = require('mongoose');
const Product = require('./models/Product'); 
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lumiere')
  .then(() => console.log("✅ MongoDB Connected..."))
  .catch(err => console.log("❌ Connection Error:", err));

const productsData = [
  // CAPS (6)
  { name: "Classic Navy Cap", price: 61, category: "Caps", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400", bgColor: "#d1d5db" },
  { name: "Urban Red Hat", price: 35, category: "Caps", image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400", bgColor: "#eac0b3" },
  { name: "Desert Sand Cap", price: 45, category: "Caps", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", bgColor: "#f3f4f6" },
  { name: "Vintage Trucker", price: 50, category: "Caps", image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400", bgColor: "#d1d5db" },
  { name: "Black Stealth Cap", price: 55, category: "Caps", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400", bgColor: "#e5e7eb" },
  { name: "Sport White Cap", price: 30, category: "Caps", image: "https://images.unsplash.com/photo-1533055640609-24b498dfd74c?w=400", bgColor: "#f3f4f6" },

  // HOODIES (6)
  { name: "Essential Red Hoodie", price: 75, category: "Hoodies", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", bgColor: "#DE8C73" },
  { name: "Midnight Black Hoodie", price: 90, category: "Hoodies", image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400", bgColor: "#d1d5db" },
  { name: "Grey Melange Hoodie", price: 85, category: "Hoodies", image: "https://images.unsplash.com/photo-1564557287817-3785e3c77f53?w=400", bgColor: "#e5e7eb" },
  { name: "Ocean Blue Fleece", price: 80, category: "Hoodies", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400", bgColor: "#f3f4f6" },
  { name: "Pastel Pink Hoodie", price: 70, category: "Hoodies", image: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=400", bgColor: "#eac0b3" },
  { name: "Olive Cargo Hoodie", price: 88, category: "Hoodies", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400", bgColor: "#d1d5db" },

  // SHIRTS (6)
  { name: "Pure White Tee", price: 25, category: "Shirts", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400", bgColor: "#f3f4f6" },
  { name: "Navy Striped Shirt", price: 45, category: "Shirts", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400", bgColor: "#d1d5db" },
  { name: "Charcoal V-Neck", price: 28, category: "Shirts", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400", bgColor: "#e5e7eb" },
  { name: "Denim Blue Shirt", price: 55, category: "Shirts", image: "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=400", bgColor: "#d1d5db" },
  { name: "Summer Linen Shirt", price: 48, category: "Shirts", image: "https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?w=400", bgColor: "#f3f4f6" },
  { name: "Black Formal Shirt", price: 50, category: "Shirts", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400", bgColor: "#d1d5db" },

  // JACKETS (6)
  { name: "Leather Biker Jacket", price: 150, category: "Jackets", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", bgColor: "#d1d5db" },
  { name: "Winter Puffer Jacket", price: 120, category: "Jackets", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400", bgColor: "#f3f4f6" },
  { name: "Yellow Windbreaker", price: 85, category: "Jackets", image: "https://images.unsplash.com/photo-1544923246-77307dd654ca?w=400", bgColor: "#DE8C73" },
  { name: "Denim Trucker Jacket", price: 95, category: "Jackets", image: "https://images.unsplash.com/photo-1576871333021-d62157d62058?w=400", bgColor: "#eac0b3" },
  { name: "Classic Bomber", price: 110, category: "Jackets", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400", bgColor: "#e5e7eb" },
  { name: "Parka Long Coat", price: 180, category: "Jackets", image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400", bgColor: "#d1d5db" },

  // SNEAKERS (6)
  { name: "Air White Sneakers", price: 130, category: "Sneakers", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", bgColor: "#f3f4f6" },
  { name: "Runner Sport Shoes", price: 95, category: "Sneakers", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400", bgColor: "#d1d5db" },
  { name: "Classic Converse Style", price: 65, category: "Sneakers", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400", bgColor: "#e5e7eb" },
  { name: "Black Pro Runners", price: 110, category: "Sneakers", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400", bgColor: "#d1d5db" },
  { name: "Retro High Tops", price: 140, category: "Sneakers", image: "https://images.unsplash.com/photo-1512374382149-4332c6c02153?w=400", bgColor: "#f3f4f6" },
  { name: "Casual Grey Loafers", price: 75, category: "Sneakers", image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400", bgColor: "#eac0b3" }
];

const seedDB = async () => {
  try {
    await Product.deleteMany({});
    console.log("🗑️ Old data cleared.");
    await Product.insertMany(productsData);
    console.log("🚀 30 Products (5 Categories) added successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    mongoose.connection.close();
  }
};

seedDB();