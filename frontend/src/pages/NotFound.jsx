import { Link } from "react-router-dom";
import Seo from "../components/Seo";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto p-8 md:p-12">
      <Seo
        title="404 - Page Not Found"
        description="The page you are looking for was not found."
        canonicalPath="/404"
        noindex
      />

      <div className="card p-8 text-center">
        <p className="text-sm font-semibold text-teal-700">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold">Page Not Found</h1>
        <p className="mt-3 text-gray-600">
          The page you are looking for doesn&apos;t exist or has moved.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
          <Link to="/products" className="btn-secondary">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
