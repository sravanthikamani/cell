import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

export default function CatalogPage() {
  const { group, type } = useParams(); // device/category + smartphones/audio
  const navigate = useNavigate();
  const [brands, setBrands] = useState({});

  useEffect(() => {
   // fetch("http://localhost:5000/api/catalog")
     // .then(res => res.json())
      //.then(data => {
      //  setBrands(data[group]?.[type] || {});
     // });
  }, [group, type]);

  const title = `${type.toUpperCase()} | ${group.toUpperCase()} | CELL`;

  return (
    <div className="max-w-6xl mx-auto p-10">
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content={`Browse ${type} brands under ${group} at CELL`}
        />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6 capitalize">
        {type}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Object.keys(brands).map((brand) => (
          <div
            key={brand}
            onClick={() =>
              navigate(`/${group}/${type}/${brand.toLowerCase()}`)
            }
            className="border p-6 rounded-lg text-center cursor-pointer hover:shadow-lg"
          >
            {brand}
          </div>
        ))}
      </div>
    </div>
  );
}
