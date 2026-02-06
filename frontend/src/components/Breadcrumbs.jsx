import { Link, useLocation } from "react-router-dom";

export default function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="px-6 py-3 text-sm text-gray-600">
      <Link to="/" className="hover:text-teal-600">Home</Link>
      {paths.map((p, i) => {
        const route = "/" + paths.slice(0, i + 1).join("/");
        return (
          <span key={route}>
            {" / "}
            <Link to={route} className="hover:text-teal-600 capitalize">
              {p}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
