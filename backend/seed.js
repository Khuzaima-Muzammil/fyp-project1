const mongoose = require('mongoose');
const Product = require('./models/Product'); 
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lumiere')
  .then(() => console.log("✅ MongoDB Connected..."))
  .catch(err => console.log("Connection Error:", err));

const categories = [
  "Caps", "T-Shirts", "Shirts", "Trousers", "Jeans", 
  "Shorts", "Sweaters", "Jackets", "Hoodies", "Coats"
];

const categoryImages = {
  "Caps": ["https://images.unsplash.com/photo-1556306535-0f09a536f0ae?q=80&w=400", "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400"],
  "T-Shirts": ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400", "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=400"],
  "Shirts": ["https://images.unsplash.com/photo-1596755094514-f87e32f6b717?q=80&w=400", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400"],
  "Trousers": ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=400", "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=400"],
  "Jeans": ["https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400", "https://images.unsplash.com/photo-1604176354204-9268737828e4?q=80&w=400"],
  "Shorts": ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=400", "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?q=80&w=400"],
  "Sweaters": ["https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=400", "https://images.unsplash.com/photo-1614838634125-992383c0f4f9?q=80&w=400"],
  "Jackets": ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400", "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400"],
  "Hoodies": ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=400"],
  "Coats": ["https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=400", "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=400"]
};

const styles = [
  "Casual", "Vintage", "Modern", "Urban", "Classic", 
  "Streetwear", "Minimalist", "Premium", "Sport", "Formal"
];

const colors = [
  "Black", "White", "Navy", "Olive", "Grey", 
  "Maroon", "Beige", "Denim", "Charcoal", "Khaki"
];

// Helper to generate 30 days of price history
const generatePriceHistory = (basePrice) => {
  const history = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const fluctuation = basePrice * (Math.random() * 0.15 - 0.075);
    const historicalPrice = Math.max(10, Math.round(basePrice + fluctuation));
    
    history.push({
      price: historicalPrice,
      date: date
    });
  }
  return history;
};

const productsData = [];
let idCounter = 1;

categories.forEach((cat) => {
  for (let i = 0; i < 10; i++) {
    const style = styles[Math.floor(Math.random() * styles.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const productName = `${color} ${style} ${cat.slice(0, cat.endsWith('s') ? -1 : undefined)}`;
    
    // Clothing prices usually between 500 and 15000 PKR
    let minPrice = 800, maxPrice = 3000;
    if (cat === "Coats" || cat === "Jackets") { minPrice = 3000; maxPrice = 12000; }
    else if (cat === "Jeans" || cat === "Sweaters" || cat === "Hoodies") { minPrice = 1500; maxPrice = 5000; }
    else if (cat === "Caps" || cat === "Socks") { minPrice = 300; maxPrice = 1200; }
    
    let currentPrice = Math.floor(Math.random() * (maxPrice - minPrice + 1) + minPrice);
    
    if (i === 0) currentPrice = minPrice;
    if (i === 9) currentPrice = maxPrice;

    // Pick a safe, human-free image from our curated list
    const imagesForCat = categoryImages[cat] || categoryImages["Shirts"];
    const image = imagesForCat[i % imagesForCat.length];

    const priceHistory = generatePriceHistory(currentPrice);

    productsData.push({
      name: productName + ` - Vol ${idCounter}`, 
      price: currentPrice,
      category: cat,
      image: image,
      bgColor: `#f3f4f6`,
      stock: Math.floor(Math.random() * 100) + 10,
      description: `Premium quality ${productName.toLowerCase()} designed for maximum comfort and style. A perfect addition to your wardrobe.`,
      priceHistory: priceHistory,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1) // 3.5 to 5.0
    });
    idCounter++;
  }
});

const seedDB = async () => {
  try {
    console.log("Clearing existing products...");
    await Product.deleteMany({});
    console.log(`Inserting ${productsData.length} clothing products...`);
    await Product.insertMany(productsData);
    console.log("✅ Database Seeded Successfully with 100 human-free clothing products!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error.message);
    mongoose.connection.close();
  }
};

seedDB();