import { MdEmail, MdPhone, MdChat } from "react-icons/md";

const supportOptions = [
  {
    icon: <MdEmail className="text-[#15949C] text-3xl" />,
    title: "Email Support",
    description: "Get help via email with a response time of 24–48 hours.",
    buttonLabel: "Email Us",
    href: "mailto:support@offerhub.com",
  },
  {
    icon: <MdChat className="text-[#15949C] text-3xl" />,
    title: "Live Chat",
    description: "Chat with our support team during business hours.",
    buttonLabel: "Start Chat",
    href: "/messages",
  },
  {
    icon: <MdPhone className="text-[#15949C] text-3xl" />,
    title: "Phone Support",
    description: "Call us directly for urgent matters and premium support.",
    buttonLabel: "Call Support",
    href: "tel:+1234567890",
  },
];

export default function ContactSupport() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-[#DEEFE7]/20 dark:bg-gray-800 py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-[#15949C]/10 border border-[#15949C]/20 rounded-full px-4 py-2 mb-4">
          <div className="w-2 h-2 bg-[#15949C] rounded-full"></div>
          <span className="text-sm font-medium text-[#15949C]">Support Options</span>
        </div>
        <h2 className="text-3xl font-bold mb-3 text-[#002333] dark:text-white">Contact Support</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          Can't find what you're looking for? Our support team is here to help.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {supportOptions.map((option, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-start shadow-sm hover:shadow-lg hover:border-[#15949C]/30 dark:hover:shadow-gray-900/20 transition-all duration-200 hover:scale-105"
            >
              <div className="bg-[#DEEFE7]/30 dark:bg-gray-700 p-3 rounded-full mb-4">
                {option.icon}
              </div>
              <h3 className="font-semibold text-lg text-[#002333] dark:text-white mb-2">
                {option.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">{option.description}</p>
              <a
                href={option.href}
                className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 bg-gradient-to-r from-[#15949C] to-[#117a81] hover:from-[#117a81] hover:to-[#0d5f65] text-white shadow-md hover:shadow-lg hover:scale-105"
              >
                {option.buttonLabel}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
