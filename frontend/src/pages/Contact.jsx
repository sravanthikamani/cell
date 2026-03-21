import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("Message sent successfully!");
        setForm({ name: "", phone: "", message: "" });
      } else {
        setStatus("Failed to send message. Please try again.");
      }
    } catch {
      setStatus("Failed to send message. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 py-12">
      <form
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg"
        onSubmit={handleSubmit}
      >
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700">Your name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-md bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your name"
          />
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your mobile number"
          />
        </div>
        <div className="mb-7">
          <label className="block mb-2 font-medium text-gray-700">Write your messages here</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full p-3 rounded-md bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your message"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-800 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-blue-900 transition disabled:opacity-60"
            disabled={loading}
          >
            Submit now
            <span className="ml-2">→</span>
          </button>
          <button
            type="button"
            className="bg-blue-800 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-blue-900 transition disabled:opacity-60"
            onClick={() => navigate("/")}
          >
            Back
          </button>
        </div>
        {status && (
          <div className="mt-4 text-center text-sm font-semibold text-blue-700">{status}</div>
        )}
      </form>
    </div>
  );
}
