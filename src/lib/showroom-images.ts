// Swap any image here: drop a new file in src/assets and change the import.
import headphones from "@/assets/headphones.png";
import watch from "@/assets/watch.png";
import phone from "@/assets/phone.png";
import vr from "@/assets/vr.png";
import laptop from "@/assets/laptop.jpg";
import camera from "@/assets/camera.jpg";
import speaker from "@/assets/speaker.jpg";
import keyboard from "@/assets/keyboard.jpg";

export type Mood = "Work" | "Play" | "Travel" | "Home" | "Create";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  img: string;
  cutout: boolean; // true = transparent PNG that can float
  rating: number;
  reviews: number;
  moods: Mood[];
  hot?: boolean;
  recommended?: boolean;
  desc: string;
  specs: string[];
};

export const products: Product[] = [
  { id: "aura", name: "Aura Over-Ear", category: "Audio", price: 449, oldPrice: 549, img: headphones, cutout: true, rating: 4.8, reviews: 1240, moods: ["Travel", "Work", "Play"], hot: true, desc: "Wireless noise-cancelling headphones with 40-hour battery and memory-foam cushions that stay comfortable all day.", specs: ["Active noise cancelling", "40h battery", "Bluetooth 5.3", "USB-C fast charge"] },
  { id: "pulse", name: "Pulse Watch", category: "Wearables", price: 349, img: watch, cutout: true, rating: 4.6, reviews: 860, moods: ["Travel", "Play"], recommended: true, desc: "A bright everyday smartwatch that tracks heart rate, sleep and workouts, with a week of battery.", specs: ["AMOLED display", "7-day battery", "GPS built in", "Water resistant 50m"] },
  { id: "prism", name: "Prism Phone", category: "Phones", price: 899, oldPrice: 1099, img: phone, cutout: true, rating: 4.7, reviews: 2310, moods: ["Create", "Travel", "Work"], hot: true, desc: "A triple-camera phone with a colour-shifting glass back and a battery that lasts two days.", specs: ["6.7\" OLED 120Hz", "50MP triple camera", "256GB storage", "5000mAh battery"] },
  { id: "void", name: "Void VR Headset", category: "Gaming", price: 1499, oldPrice: 1899, img: vr, cutout: true, rating: 4.5, reviews: 412, moods: ["Play"], hot: true, desc: "Standalone mixed-reality headset with crisp lenses and hand tracking — no cables, no PC needed.", specs: ["4K per eye", "Hand tracking", "Standalone", "128GB storage"] },
  { id: "folio", name: "Folio Laptop 14", category: "Laptops", price: 1199, img: laptop, cutout: false, rating: 4.9, reviews: 980, moods: ["Work", "Create"], recommended: true, desc: "Thin, quiet and light aluminium laptop with an all-day battery and a sharp, warm display.", specs: ["14\" 2.8K display", "16GB RAM", "1TB SSD", "18h battery"] },
  { id: "lens", name: "Classic Mirrorless", category: "Cameras", price: 899, oldPrice: 999, img: camera, cutout: false, rating: 4.8, reviews: 655, moods: ["Create", "Travel"], hot: true, recommended: true, desc: "Retro dials, modern sensor. A compact mirrorless camera that makes you want to go outside.", specs: ["26MP sensor", "4K video", "Tactile dials", "Includes 23mm lens"] },
  { id: "hearth", name: "Hearth Speaker", category: "Audio", price: 229, img: speaker, cutout: false, rating: 4.7, reviews: 730, moods: ["Home"], recommended: true, desc: "Walnut and linen speaker that fills a room with warm sound and looks lovely on a shelf.", specs: ["360° sound", "Wi-Fi + Bluetooth", "Real wood case", "Multi-room"] },
  { id: "keys", name: "Terra Keyboard", category: "Accessories", price: 159, oldPrice: 189, img: keyboard, cutout: false, rating: 4.9, reviews: 1520, moods: ["Work", "Create", "Home"], hot: true, recommended: true, desc: "A satisfying mechanical keyboard with hot-swap switches and earthy cream-and-clay keycaps.", specs: ["Hot-swap switches", "Wireless + wired", "PBT keycaps", "3-month battery"] },
];

export const moods: { mood: Mood; emoji: string; line: string }[] = [
  { mood: "Work", emoji: "💼", line: "I want to get things done" },
  { mood: "Play", emoji: "🎮", line: "I want to have fun" },
  { mood: "Travel", emoji: "✈️", line: "I'm always on the move" },
  { mood: "Home", emoji: "🏡", line: "I want a cozy setup" },
  { mood: "Create", emoji: "🎨", line: "I make things" },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
