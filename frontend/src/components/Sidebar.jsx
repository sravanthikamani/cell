import { NavLink } from "react-router-dom";

const sidebarLinks = [
  {
    title: "Device",
    links: [
      { label: "Smartphones", to: "/device/smartphones" },
      { label: "Tablets", to: "/device/tablets" },
      { label: "Wearables", to: "/device/wearables" },
      { label: "Accessories", to: "/device/accessories" },
    ],
  },
  {
    title: "Category",
    links: [
      { label: "Audio", to: "/category/audio" },
      { label: "Chargers", to: "/category/chargers" },
      { label: "Cables", to: "/category/cables" },
      { label: "Power Banks", to: "/category/power-banks" },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-full md:w-64 bg-white rounded-xl shadow-lg p-4 mb-6 md:mb-0 md:mr-8">
      {sidebarLinks.map((section) => (
        <div key={section.title} className="mb-6">
          <h3 className="text-lg font-bold mb-3 text-blue-900">{section.title}</h3>
          <ul className="space-y-2">
            {section.links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded transition-colors font-medium ${
                      isActive ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50 text-slate-800"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
