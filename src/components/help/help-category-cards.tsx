import { MdMenuBook, MdLiveHelp, MdSmartDisplay } from "react-icons/md";
import Link from "next/link";

const categories = [
  {
    icon: <MdMenuBook className="text-teal-600 text-3xl" />,
    title: "Browse FAQ",
    description:
      "Find answers to the most common questions about using Offer Hub.",
    linkText: "View FAQ",
    linkHref: "#",
  },
  {
    icon: <MdLiveHelp className="text-teal-600 text-3xl" />,
    title: "Submit a Ticket",
    description:
      "Need specific help? Submit a support ticket and we’ll get back to you.",
    linkText: "Create Ticket",
    linkHref: "#",
  },
  {
    icon: <MdSmartDisplay className="text-teal-600 text-3xl" />,
    title: "Video Tutorials",
    description:
      "Watch step-by-step tutorials to learn how to use Offer Hub effectively.",
    linkText: "Watch Tutorials",
    linkHref: "#",
  },
];

export default function HelpCategoryCards() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat, idx) => (
        <div
          key={idx}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/20 transition-shadow"
        >
          <div className="mb-4 bg-teal-50 dark:bg-gray-700 w-fit p-3 rounded-full">
            {cat.icon}
          </div>
          <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">{cat.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{cat.description}</p>
          <Link
            href={cat.linkHref}
            className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline"
          >
            {cat.linkText} →
          </Link>
        </div>
      ))}
    </div>
  );
}
