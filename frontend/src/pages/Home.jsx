import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../lib/api";

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/catalog`)
      .then((res) => res.json())
      .then((data) => {
        const list = [];
        Object.values(data).forEach((g) =>
          Object.values(g).forEach((t) =>
            Object.values(t).forEach((b) => b.forEach((p) => list.push(p)))
          )
        );
        setFeatured(list.slice(0, 6));
      })
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div className="px-6 md:px-10 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-slate-900 text-white p-8 md:p-14">
        <div className="max-w-2xl">
          <p className="uppercase tracking-widest text-xs text-teal-100 mb-2">
            New Season Tech
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Power your day with devices that feel futuristic
          </h1>
          <p className="mt-4 text-teal-100 text-sm md:text-base">
            Flagship phones, premium audio, and smart accessories curated for
            everyday performance.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/products" className="btn-primary">
              Shop All
            </Link>
            <Link
              to="/device/smartphones"
              className="btn-secondary"
            >
              Explore Phones
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute right-10 top-8 w-24 h-24 bg-orange-400/80 rounded-full blur-xl" />
      </div>

      {/* Categories */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Smartphones", path: "/device/smartphones" },
          { label: "Tablets", path: "/device/tablets" },
          { label: "Audio", path: "/category/audio" },
          { label: "Accessories", path: "/device/accessories" },
        ].map((c) => (
          <Link
            key={c.label}
            to={c.path}
            className="card p-5"
          >
            <div className="text-xs uppercase text-gray-500">
              Category
            </div>
            <div className="mt-2 font-semibold">{c.label}</div>
          </Link>
        ))}
      </div>

      {/* Featured */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-sm text-teal-700">
            View all
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className="card p-4"
            >
              <img
                src={
                  p.images?.[0]?.startsWith("/uploads")
                    ? `${API_BASE}${p.images?.[0]}`
                    : p.images?.[0]
                }
                alt={p.name}
                className="h-44 w-full object-cover rounded-xl"
              />
              <div className="mt-3">
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600">₹{p.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Value props */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Fast Shipping",
            desc: "Reliable delivery with tracking on every order.",
          },
          {
            title: "Secure Payments",
            desc: "Stripe-powered checkout with full encryption.",
          },
          {
            title: "Quality Promise",
            desc: "Curated gadgets with verified quality checks.",
          },
        ].map((v) => (
          <div key={v.title} className="card p-5">
            <div className="font-semibold">{v.title}</div>
            <div className="text-sm text-gray-600 mt-2">{v.desc}</div>
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <div className="mt-12 rounded-3xl bg-slate-900 text-white p-8 md:p-12">
        <div className="md:flex items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Get early access deals</h3>
            <p className="text-sm text-slate-300 mt-2">
              Sign up to receive launches, price drops, and exclusive offers.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2 w-full md:w-auto">
            <input
              placeholder="Your email"
              className="flex-1 md:w-64 rounded-full px-4 py-2 text-slate-900"
            />
            <button className="btn-primary">
              Notify me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
