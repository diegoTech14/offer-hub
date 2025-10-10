import { MdMenuBook, MdLiveHelp, MdSmartDisplay } from "react-icons/md";
import Link from "next/link";

const categories = [
  {
    icon: <MdMenuBook className="text-[#15949C] text-3xl" />,
    title: "Browse FAQ",
    description:
      "Find answers to the most common questions about using Offer Hub.",
    linkText: "View FAQ",
    linkHref: "/faq",
  },
  {
    icon: <MdLiveHelp className="text-[#15949C] text-3xl" />,
    title: "Submit a Ticket",
    description:
      "Need specific help? Submit a support ticket and we'll get back to you.",
    linkText: "Create Ticket",
    linkHref: "#",
  },
  {
    icon: <MdSmartDisplay className="text-[#15949C] text-3xl" />,
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
          className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200 hover:scale-105 hover:border-[#15949C]/30"
        >
          <div className="mb-4 bg-[#DEEFE7]/30 dark:bg-gray-700 w-fit p-3 rounded-full">
            {cat.icon}
          </div>
          <h3 className="text-lg font-semibold mb-2 text-[#002333] dark:text-white">{cat.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{cat.description}</p>
          <Link
            href={cat.linkHref}
            className="inline-flex items-center gap-1 text-sm text-[#15949C] dark:text-[#15949C] font-medium hover:underline transition-all"
          >
            {cat.linkText} →
          </Link>
        </div>
      ))}
    </div>
  );
}
