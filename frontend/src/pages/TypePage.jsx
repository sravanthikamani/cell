import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

export default function TypePage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [brands, setBrands] = useState({});

  useEffect(() => {
   // fetch("http://localhost:5000/api/catalog")
      //.then(res => res.json())
      //.then(data => setBrands(data[type] || {}));
  }, [type]);

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <Helmet>
        <title>{type.toUpperCase()} | CELL</title>
      </Helmet>

      <h1 className="text-3xl font-bold mb-6 capitalize">{type}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Object.keys(brands).map((brand) => (
          <div
            key={brand}
            onClick={() => navigate(`/${type}/${brand.toLowerCase()}`)}
            className="border p-6 rounded-lg cursor-pointer hover:shadow-lg text-center"
          >
            {brand}
          </div>
        ))}
      </div>
    </div>
  );
}
