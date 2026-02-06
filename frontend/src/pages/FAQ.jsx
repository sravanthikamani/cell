import { useParams } from "react-router-dom";

export default function FAQ() {
  const { item } = useParams();

  return (
    <div className="p-10 text-2xl font-semibold">
      FAQ: {item}
    </div>
  );
}
