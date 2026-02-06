import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto p-10">
      <Helmet>
        <title>About CELL</title>
        <meta
          name="description"
          content="About CELL electronics brand"
        />
      </Helmet>

      <h1 className="text-4xl font-bold mb-4 text-teal-600">
        About CELL
      </h1>
      <p className="text-gray-600 leading-relaxed">
        CELL is a modern electronics brand delivering smartphones,
        accessories, and innovative tech products with quality and trust.
      </p>
    </div>
  );
}
