// Swap any image here: drop a new file in src/assets and change the import.
import headphones from "@/assets/headphones.png";
import watch from "@/assets/watch.png";
import phone from "@/assets/phone.png";
import vr from "@/assets/vr.png";

export const products = [
  { id: "aura", name: "Aura Max", tag: "Audio", price: "$549", img: headphones, hue: 170, desc: "Spatial sound wrapped in liquid chrome." },
  { id: "pulse", name: "Pulse One", tag: "Wearable", price: "$399", img: watch, hue: 150, desc: "A holographic glass face on your wrist." },
  { id: "prism", name: "Prism X", tag: "Mobile", price: "$1,099", img: phone, hue: 260, desc: "Iridescent glass that shifts with light." },
  { id: "void", name: "Void Vision", tag: "Mixed Reality", price: "$1,899", img: vr, hue: 300, desc: "Step through the visor into new worlds." },
];
