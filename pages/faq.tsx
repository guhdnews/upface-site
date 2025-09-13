import Layout from '../components/Layout';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    category: 'General',
    questions: [
      { 
        q: 'How long does a typical project take?', 
        a: 'Project timelines vary by package: Essentials (2-3 weeks), Professional (3-4 weeks), Enterprise (4-6 weeks). We provide detailed timelines during our initial consultation and keep you updated throughout the process.' 
      },
      { 
        q: 'What makes Upface different from other web development agencies?', 
        a: 'We specialize exclusively in local businesses and understand their unique challenges. Our solutions are built with the same quality as enterprise software but designed for the specific needs of restaurants, construction companies, salons, and other local services.' 
      },
      { 
        q: 'Do you work with businesses outside our local area?', 
        a: 'Yes, we work with local businesses nationwide. While we started locally, our expertise in serving small and medium businesses translates well regardless of location.' 
      }
    ]
  },
  {
    category: 'Services & Pricing',
    questions: [
      { 
        q: 'How much do your services cost?', 
        a: 'Our packages start at the Essentials level for smaller businesses, with Professional and Enterprise options for more advanced needs. We provide transparent pricing with no hidden fees. Contact us for a detailed quote based on your specific requirements.' 
      },
      { 
        q: 'Can you build custom features for my business?', 
        a: 'Absolutely. Whether you need a custom booking system, inventory management, quote calculators, or specialized workflows, we build features tailored to your specific business processes.' 
      },
      { 
        q: 'Do you provide ongoing maintenance and support?', 
        a: 'Yes, all packages include support periods (3-12 months depending on package). We also offer ongoing maintenance plans that include regular updates, backups, security monitoring, and technical support.' 
      },
      { 
        q: 'What if I need changes after the website is live?', 
        a: 'Minor content updates are included in your support period. For larger changes or new features, we provide competitive rates for additional development work.' 
      }
    ]
  },
  {
    category: 'Technical',
    questions: [
      { 
        q: 'Will my website work on mobile devices?', 
        a: 'Yes, every website we build is mobile-first and fully responsive. With most customers browsing on phones, we ensure your site looks perfect and functions flawlessly on all devices.' 
      },
      { 
        q: 'How fast will my website load?', 
        a: 'We optimize all websites for speed with a goal of under 2-second load times. Fast websites improve customer experience and search engine rankings, which directly impacts your business success.' 
      },
      { 
        q: 'Will you help with SEO and getting found on Google?', 
        a: 'Yes, basic SEO is included in all packages, and advanced SEO is included in Professional and Enterprise packages. We optimize for local search, helping customers in your area find your business easily.' 
      },
      { 
        q: 'Can I update the website content myself?', 
        a: 'Yes, we build user-friendly content management systems that allow you to update text, images, prices, and other content without technical knowledge. We provide training to ensure you’re comfortable making updates.' 
      },
      { 
        q: 'What happens to my website if something goes wrong?', 
        a: 'We maintain regular backups and monitoring. If issues arise, we can quickly restore your site. Our hosting solutions include 99.9% uptime guarantees and 24/7 monitoring.' 
      }
    ]
  },
  {
    category: 'Process & Communication',
    questions: [
      { 
        q: 'What information do you need to get started?', 
        a: 'We’ll start with a consultation to understand your business, goals, and specific needs. You’ll need to provide content (text, images, logo) and any specific functionality requirements. We guide you through the entire process.' 
      },
      { 
        q: 'How involved do I need to be during development?', 
        a: 'We handle the technical work, but we need your input on design preferences, content, and functionality. We typically have 2-3 review checkpoints where your feedback guides the final result.' 
      },
      { 
        q: 'Will I own the website and all the code?', 
        a: 'Yes, you own everything. Once the project is complete and paid for, you have full ownership of the code, design, and content. No vendor lock-in or ongoing licensing fees.' 
      },
      { 
        q: 'What if I’m not satisfied with the result?', 
        a: 'We work closely with you throughout the process to ensure satisfaction. We offer revisions during development and won’t consider the project complete until you’re happy with the result.' 
      }
    ]
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <Layout title="FAQ - Upface">
      <section className="py-32 bg-black">
        <div className="section-container">
          <div className="text-center mb-24">
            <h1 className="text-5xl md:text-7xl font-light text-white mb-8">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Everything you need to know about working with Upface and our services.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-16">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className={categoryIndex > 0 ? 'pt-40' : 'pt-8'}>
                <h2 className="text-3xl font-light text-white mb-8 text-center pt-40">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const id = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openItems.includes(id);
                    
                    return (
                      <div key={questionIndex} className="border border-gray-800 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleItem(id)}
                          className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-900/30 transition-colors duration-200"
                        >
                          <span className="text-lg font-medium text-white pr-4">{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
                          ) : (
                            <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 pt-2">
                            <div className="pl-6 border-l-2 border-gray-800">
                              <p className="text-gray-400 font-light leading-relaxed">{faq.a}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-32 pt-32 border-t border-gray-800 pb-40">
            <h2 className="text-3xl font-light text-white mb-6">Still have questions?</h2>
            <p className="text-xl text-gray-400 font-light mb-8 max-w-2xl mx-auto">
              We&apos;re here to help. Get in touch and we&apos;ll answer any questions about your project.
            </p>
            <Link
              href="/contact"
              className="btn btn-primary"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
