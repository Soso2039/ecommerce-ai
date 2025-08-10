export type Product = {
  id: string;
  name: string;
  price: number;
  category: "Shoes" | "Electronics" | "Apparel" | "Accessories" | "Watches" | "Bags";
  rating: number; // 1..5
  description: string;
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Trail Runner 2",
    price: 89.99,
    category: "Shoes",
    rating: 4.5,
    description: "Lightweight trail running shoes with breathable mesh and strong traction."
  },
  {
    id: "p2",
    name: "Urban Jogger",
    price: 69.0,
    category: "Shoes",
    rating: 4.1,
    description: "Comfort-focused everyday running shoes for pavement and treadmill."
  },
  {
    id: "p3",
    name: "Aero Wireless Headphones",
    price: 129.99,
    category: "Electronics",
    rating: 4.3,
    description: "Over-ear Bluetooth headphones with ANC and 30-hour battery life."
  },
  {
    id: "p4",
    name: "Nimbus Earbuds Pro",
    price: 99.99,
    category: "Electronics",
    rating: 4.0,
    description: "True wireless earbuds with IPX5 water resistance and clear calls."
  },
  {
    id: "p5",
    name: "All-Weather Jacket",
    price: 119.0,
    category: "Apparel",
    rating: 4.6,
    description: "Water-resistant shell with breathable lining for daily commuting."
  },
  {
    id: "p6",
    name: "Merino Tee",
    price: 39.0,
    category: "Apparel",
    rating: 4.2,
    description: "Soft merino wool T-shirt, odor-resistant and temperature-regulating."
  },
  {
    id: "p7",
    name: "Daypack 20L",
    price: 59.0,
    category: "Bags",
    rating: 4.4,
    description: "Minimal everyday backpack with padded laptop sleeve and side pockets."
  },
  {
    id: "p8",
    name: "Summit Hiker Pack 30L",
    price: 89.0,
    category: "Bags",
    rating: 4.1,
    description: "Trail-ready backpack with ventilated back panel and hydration port."
  },
  {
    id: "p9",
    name: "Steel Chrono Watch",
    price: 149.0,
    category: "Watches",
    rating: 4.3,
    description: "Stainless steel chronograph with sapphire glass and 5ATM rating."
  },
  {
    id: "p10",
    name: "Canvas Belt",
    price: 19.0,
    category: "Accessories",
    rating: 4.0,
    description: "Durable canvas belt with low-profile buckle for daily wear."
  }
];
