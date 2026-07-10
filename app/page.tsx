import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";

export default function HomePage() {
  return (
    <div className="hero-glow relative isolate flex min-h-screen flex-col">
      <Navbar />
      <Hero />
    </div>
  );
}