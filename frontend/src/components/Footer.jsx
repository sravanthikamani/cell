import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">HITECH</h3>
            <p className="text-slate-300 text-sm mb-4">
              Your trusted destination for premium electronics and accessories.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-slate-300 hover:text-white transition">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-300 hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/warranty" className="text-slate-300 hover:text-white transition">
                  Warranty
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-slate-300 hover:text-white transition">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span className="text-slate-300">+39 353 349 5253</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span className="text-slate-300">info@hitechcinisello.it</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1" />
                <span className="text-slate-300">
                  Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © {currentYear} HITECH. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white text-sm transition">
                Privacy
              </a>
              <a href="#" className="text-slate-400 hover:text-white text-sm transition">
                Terms
              </a>
              <a href="#" className="text-slate-400 hover:text-white text-sm transition">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
