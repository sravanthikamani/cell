
import { useEffect } from "react";
import { useI18n } from "../context/I18nContext";
import Seo from "../components/Seo";
import {
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Plug,
  Wrench,
  ShieldCheck,
  BadgeCheck,
  TimerReset,
  DollarSign,
  Smile,
  MapPin,
  PhoneCall,
  Laptop2,
  Usb,
  BatteryFull,
  RefreshCw,
  Droplet,
  Cpu,
  Keyboard,
  MonitorSmartphone,
  CheckCircle2,
  Users,
  Rocket,
} from "lucide-react";

export default function About() {
  const { t } = useI18n();

  useEffect(() => {
    document.body.classList.add("about-bg-active");
    return () => {
      document.body.classList.remove("about-bg-active");
    };
  }, []);

  return (
    <div className="about-page-bg min-h-screen py-10 px-2">
      <Seo
          title={t("About Us")}
          description="Hitech Cinisello is a modern electronics brand delivering smartphones, accessories, and innovative tech products with quality and trust."
        canonicalPath="/about"
      />
      <div className="max-w-4xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-6 md:p-12 animate-slide-in-left">
        <h1 className="text-3xl font-extrabold mb-3 text-center text-blue-900 tracking-tight drop-shadow-lg flex items-center justify-center gap-3">
          <Rocket className="inline-block text-pink-500 animate-bounce" size={32} /> About Us
        </h1>
        <p className="text-base text-center mb-6 font-semibold text-blue-600 drop-shadow-[0_2px_8px_rgba(0,132,255,0.25)]" style={{textShadow: '0 2px 12px #3b82f6, 0 1px 0 #fff'}}> 
          Hitech Cinisello is your trusted destination for the latest gadgets and professional repair services. We combine technology, expertise, and customer care to keep you connected and empowered.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-lg">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-blue-800"><Smartphone className="text-blue-500" /> Smartphones</h2>
            <p className="mb-1 text-gray-700 text-sm">Discover the latest smartphones from top brands with advanced features, powerful performance, and stylish designs. From budget-friendly models to flagship devices, we have something for everyone.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 p-5 shadow-lg">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-pink-800"><Tablet className="text-pink-500" /> Tablets</h2>
            <p className="mb-1 text-gray-700 text-sm">Stay productive and entertained with our range of tablets perfect for students, professionals, and multimedia lovers.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 p-5 shadow-lg">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-violet-800"><Watch className="text-violet-500" /> Smartwatches</h2>
            <p className="mb-1 text-gray-700 text-sm">Track your fitness, stay connected, and enhance your lifestyle with modern smartwatches featuring health monitoring and smart notifications.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 shadow-lg">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-yellow-800"><Headphones className="text-yellow-500" /> Audio Devices</h2>
            <p className="mb-1 text-gray-700 text-sm">Experience superior sound quality with our collection of earphones, headphones, Bluetooth speakers, and more.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-lg mb-10">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-green-800"><Plug className="text-green-500" /> Accessories</h2>
          <ul className="list-disc pl-6 text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-x-8 text-sm">
            <li className="flex items-center gap-2"><Plug className="text-green-400" size={18}/> Chargers</li>
            <li className="flex items-center gap-2"><Usb className="text-green-400" size={18}/> USB cables</li>
            <li className="flex items-center gap-2"><BatteryFull className="text-green-400" size={18}/> Power banks</li>
            <li className="flex items-center gap-2"><MonitorSmartphone className="text-green-400" size={18}/> Phone cases</li>
            <li className="flex items-center gap-2"><ShieldCheck className="text-green-400" size={18}/> Screen protectors</li>
          </ul>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-5 shadow-lg mb-10">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-orange-800"><Wrench className="text-orange-500" /> Repair Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-base flex items-center gap-1 mb-1"><Smartphone className="text-blue-400" size={18}/> Mobile Repair</h3>
              <ul className="list-disc pl-5 text-gray-700 text-xs space-y-1">
                <li>Screen replacement</li>
                <li>Battery replacement</li>
                <li>Charging port repair</li>
                <li>Software issues & updates</li>
                <li>Water damage repair</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-base flex items-center gap-1 mb-1"><Laptop2 className="text-green-400" size={18}/> Laptop Repair</h3>
              <ul className="list-disc pl-5 text-gray-700 text-xs space-y-1">
                <li>Hardware repair & upgrades</li>
                <li>Keyboard replacement</li>
                <li>OS installation & troubleshooting</li>
                <li>Virus removal</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-base flex items-center gap-1 mb-1"><Watch className="text-violet-400" size={18}/> Gadget Repairs</h3>
              <ul className="list-disc pl-5 text-gray-700 text-xs space-y-1">
                <li>Tablets</li>
                <li>Smartwatches</li>
                <li>Audio devices</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-lg mb-10">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-blue-800"><CheckCircle2 className="text-blue-500" /> Why Choose Us?</h2>
          <ul className="list-none pl-0 text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-x-8 text-sm">
            <li className="flex items-center gap-2"><BadgeCheck className="text-green-500" size={20}/> Certified technicians</li>
            <li className="flex items-center gap-2"><ShieldCheck className="text-blue-500" size={20}/> Genuine spare parts</li>
            <li className="flex items-center gap-2"><TimerReset className="text-pink-500" size={20}/> Quick turnaround time</li>
            <li className="flex items-center gap-2"><DollarSign className="text-yellow-500" size={20}/> Affordable pricing</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={20}/> Warranty on repairs</li>
            <li className="flex items-center gap-2"><Smile className="text-pink-500" size={20}/> Friendly customer support</li>
          </ul>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 p-5 shadow-lg mb-10">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-violet-800"><Rocket className="text-violet-500" /> Our Mission</h2>
          <p className="text-gray-700 text-sm">Our mission is to provide high-quality gadgets and reliable repair services at affordable prices, ensuring customer satisfaction and long-term trust.</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 p-5 shadow-lg mb-10 flex flex-col md:flex-row items-center gap-6">
          <MapPin className="text-pink-500 animate-bounce" size={32} />
          <div>
            <h2 className="text-lg font-bold mb-1 text-pink-800">Visit Our Store</h2>
            <p className="text-gray-700 text-sm mb-1">Step into our store for hands-on experience with the latest gadgets or get your devices repaired by experts. We’re here to help you stay connected with the best technology.</p>
            <a
              href="https://www.google.com/maps?q=Viale+Rinascita,+96,+20092+Cinisello+Balsamo+MI,+Italy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline font-semibold hover:text-blue-900 text-sm"
            >
              Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy
            </a>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-lg mb-4 flex flex-col md:flex-row items-center gap-6">
          <PhoneCall className="text-green-500 animate-pulse" size={32} />
          <div>
            <h2 className="text-lg font-bold mb-1 text-green-800">Contact Us</h2>
            <p className="text-gray-700 text-sm mb-1">Have questions or need a repair? <span className="font-semibold text-blue-700">Contact us today</span> and our team will assist you quickly.</p>
            <span className="text-green-700 font-bold text-base">+39 353 349 5253</span>
          </div>
        </div>
      </div>
    </div>
  );
}
