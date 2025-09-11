import Layout from '../components/Layout';
import Link from 'next/link';

const demos = [
  { 
    title: 'Bella Vista Restaurant', 
    category: 'Restaurant Website',
    desc: 'Modern restaurant site with online ordering, menu showcase, and reservation system.',
    features: ['Online Ordering', 'Menu Display', 'Reservations', 'Mobile Responsive'],
    tech: 'Next.js • Stripe • Firebase'
  },
  { 
    title: 'Elite Construction', 
    category: 'Construction Company',
    desc: 'Professional construction company site with project gallery and quote system.',
    features: ['Project Gallery', 'Quote Calculator', 'Team Profiles', 'Client Portal'],
    tech: 'React • Node.js • PostgreSQL'
  },
  { 
    title: 'FreshClean Pro', 
    category: 'Service App',
    desc: 'Full-service cleaning app with booking, tracking, and customer management.',
    features: ['Online Booking', 'GPS Tracking', 'Payment Processing', 'Staff Management'],
    tech: 'React Native • Express • MongoDB'
  },
  { 
    title: 'Premier Plumbing', 
    category: 'Service Website',
    desc: 'Emergency plumbing service with instant booking and real-time scheduling.',
    features: ['Emergency Booking', 'Live Chat', 'Service Tracking', 'Invoice System'],
    tech: 'Next.js • Twilio • Stripe'
  },
  { 
    title: 'Style Studio Salon', 
    category: 'Booking Platform',
    desc: 'Salon booking platform with stylist profiles and appointment management.',
    features: ['Stylist Booking', 'Service Packages', 'Customer Profiles', 'Loyalty Program'],
    tech: 'Vue.js • Laravel • MySQL'
  },
  { 
    title: 'PowerFit Gym', 
    category: 'Membership Platform',
    desc: 'Complete gym management with classes, memberships, and member portal.',
    features: ['Class Booking', 'Membership Management', 'Trainer Profiles', 'Progress Tracking'],
    tech: 'React • Django • Redis'
  }
];

export default function Demos() {
  return (
    <Layout title="Our Work - Upface">
      {/* Hero Section */}
      <div className="content-block">
        <div className="section-container">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-light text-white mb-8">Our Work</h1>
            <p className="text-2xl text-gray-400 font-light max-w-4xl mx-auto">
              Real solutions for real businesses. See how we&apos;ve helped local companies transform their digital presence.
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="content-block">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {demos.map((demo, index) => (
              <div key={demo.title} className={`p-12 ${index % 2 === 0 ? 'bg-black border-r border-b border-gray-800' : 'bg-white border-b border-gray-300'}`}>
                <div className="mb-8">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center mb-6">
                    <p className={`text-lg font-light ${index % 2 === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                      {demo.title} Preview
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className={`text-sm font-medium mb-2 ${index % 2 === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                      {demo.category}
                    </p>
                    <h3 className={`text-3xl font-light mb-4 ${index % 2 === 0 ? 'text-white' : 'text-black'}`}>
                      {demo.title}
                    </h3>
                    <p className={`text-lg font-light leading-relaxed mb-6 ${index % 2 === 0 ? 'text-gray-300' : 'text-gray-600'}`}>
                      {demo.desc}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {demo.features.map((feature, idx) => (
                      <div key={idx} className={`text-sm font-light ${index % 2 === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className={`mr-2 ${index % 2 === 0 ? 'text-white' : 'text-black'}`}>•</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mb-8">
                    <p className={`text-xs font-medium ${index % 2 === 0 ? 'text-gray-500' : 'text-gray-500'}`}>
                      {demo.tech}
                    </p>
                  </div>
                  
                  <Link
                    href="/contact"
                    className={`inline-block px-8 py-3 font-medium transition-colors ${
                      index % 2 === 0 
                        ? 'bg-white text-black hover:bg-gray-100' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    Discuss Similar Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="content-block-white">
        <div className="section-container">
          <div className="text-center">
            <h2 className="text-5xl font-light text-black mb-8">Ready to build something amazing?</h2>
            <p className="text-xl text-gray-600 font-light mb-12 max-w-3xl mx-auto">
              Every project is unique. Let&apos;s discuss how we can create a custom solution for your business.
            </p>
            <Link
              href="/contact"
              className="btn-dark inline-block"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
