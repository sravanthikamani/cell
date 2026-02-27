import { useParams, Link } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import Seo from "../components/Seo";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ_DATA = {
  shipping: {
    title: "Shipping",
    faqs: [
      {
        question: "How long does shipping take?",
        answer: "Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business days delivery."
      },
      {
        question: "What are the shipping costs?",
        answer: "Shipping is free for orders above ₹999. For orders below that amount, a standard shipping fee of ₹99 applies."
      },
      {
        question: "Do you ship internationally?",
        answer: "Currently, we ship within India only. We are working on expanding our international shipping options."
      },
      {
        question: "Can I track my order?",
        answer: "Yes, you will receive a tracking number via email once your order is shipped. You can use it to track your package in real-time."
      },
      {
        question: "What if my package is damaged?",
        answer: "If your package arrives damaged, please contact our support team immediately with photos. We will arrange a replacement or refund."
      }
    ]
  },
  product: {
    title: "Product",
    faqs: [
      {
        question: "How do I know if a product is authentic?",
        answer: "All our products are sourced directly from authorized distributors and come with original packaging and documentation."
      },
      {
        question: "Can I return a product?",
        answer: "Yes, we offer a 30-day return policy for most products. Items must be unused and in original packaging."
      },
      {
        question: "Do you sell refurbished products?",
        answer: "No, we only sell brand new, original products. All items come with manufacturer warranty."
      },
      {
        question: "Are there bulk discounts available?",
        answer: "Yes, we offer special pricing for bulk orders. Please contact our sales team for a customized quote."
      },
      {
        question: "How can I compare products?",
        answer: "Use the comparison feature on our product pages to view specifications side-by-side before making a decision."
      }
    ]
  },
  warranty: {
    title: "Warranty",
    faqs: [
      {
        question: "What warranty do products come with?",
        answer: "Most products come with a 1-year manufacturer warranty covering defects in materials and workmanship."
      },
      {
        question: "What does the warranty cover?",
        answer: "The warranty covers manufacturing defects and malfunctions. It does not cover physical damage, water damage, or misuse."
      },
      {
        question: "How do I claim warranty?",
        answer: "Contact our support team with your order number and a description of the issue. We will guide you through the warranty claim process."
      },
      {
        question: "Is accidental damage covered?",
        answer: "Standard warranty does not cover accidental damage. We offer extended warranty plans that include accidental damage protection."
      },
      {
        question: "Can I extend my warranty?",
        answer: "Yes, extended warranty plans are available for most products at the time of purchase or within 30 days."
      }
    ]
  },
  general: {
    title: "General",
    faqs: [
      {
        question: "How do I create an account?",
        answer: "Click on the 'Register' button in the navigation menu and fill in your details. You'll need to verify your email to complete registration."
      },
      {
        question: "How do I reset my password?",
        answer: "Click on 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your inbox."
      },
      {
        question: "Is my personal information secure?",
        answer: "Yes, we use industry-standard encryption and follow all data protection regulations. Your information is never shared with third parties."
      },
      {
        question: "How can I contact customer support?",
        answer: "You can reach our support team via email at support@hitech.com or call us at 1-800-HITECH-1 from 9 AM to 6 PM IST."
      },
      {
        question: "Do you have a physical store?",
        answer: "Currently, we operate online only. We have distribution centers in major Indian cities for faster delivery."
      }
    ]
  }
};

export default function FAQ() {
  const { item } = useParams();
  const { t } = useI18n();
  const [expandedIndex, setExpandedIndex] = useState(0);

  const resolvedItem = String(item || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "general";

  const categoryKey = Object.keys(FAQ_DATA).find(
    (key) => key === resolvedItem
  ) || "general";

  const category = FAQ_DATA[categoryKey];

  // Main FAQ page (when no item specified)
  if (!item) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Seo
          title={`${t("FAQ")} - Frequently Asked Questions`}
          description="Find answers to commonly asked questions about shipping, products, warranty, and more."
          canonicalPath="/faq"
        />
        
        <h1 className="text-4xl font-bold text-center mb-4">{t("FAQ")}</h1>
        <p className="text-center text-gray-600 mb-12">
          Find answers to commonly asked questions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(FAQ_DATA).map(([key, data]) => (
            <Link
              key={key}
              to={`/faq/${key}`}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-teal-600 hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-2">{data.title}</h3>
              <p className="text-gray-600 text-sm">
                {data.faqs.length} frequently asked questions
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Individual FAQ category page
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Seo
        title={`${t("FAQ")} - ${category.title}`}
        description={`Frequently asked questions about ${category.title} at HI-TECH.`}
        canonicalPath={`/faq/${categoryKey}`}
      />

      <div className="mb-8">
        <Link to="/faq" className="text-teal-600 hover:text-teal-700 mb-4 inline-block">
          ← Back to FAQ Categories
        </Link>
        <h1 className="text-4xl font-bold mb-2">{category.title}</h1>
        <p className="text-gray-600">{category.faqs.length} commonly asked questions</p>
      </div>

      <div className="space-y-4">
        {category.faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
              className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
            >
              <h3 className="text-lg font-semibold text-left">{faq.question}</h3>
              <ChevronDown
                size={20}
                className={`transition-transform ${
                  expandedIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedIndex === index && (
              <div className="p-4 bg-white border-t border-gray-200">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-teal-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Didn't find your answer?</h3>
        <p className="text-gray-700">
          Contact our support team at support@hitech.com or call 1-800-HITECH-1
        </p>
      </div>
    </div>
  );
}
