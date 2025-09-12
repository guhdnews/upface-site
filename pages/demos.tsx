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
      <section className="section section--black">
        <div className="section-container text-center">
          <h1>Our Work</h1>
          <p className="text-large">
            Real solutions for real businesses. See how we&apos;ve helped local companies transform their digital presence.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {demos.map((demo, index) => (
          <div key={demo.title} className={`p-8 ${index % 2 === 0 ? 'bg-black border-r border-b border-gray-800' : 'bg-white border-b border-gray-300'}`}>
            <div className="mb-6">
              <div className="aspect-video mb-6 flex items-center justify-center bg-gray-100 border">
                <p className={`text-lg text-center ${index % 2 === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                  {demo.title} Preview
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className={`text-sm font-medium mb-2 ${index % 2 === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                  {demo.category}
                </p>
                <h3 className={`mb-4 pt-2 ${index % 2 === 0 ? 'text-white' : 'text-black'}`}>
                  {demo.title}
                </h3>
                <p className={`text-large mb-6 ${index % 2 === 0 ? 'text-gray-300' : 'text-gray-600'}`}>
                  {demo.desc}
                </p>
              </div>
              
              <div className="mb-6">
                <ul className="space-y-2">
                  {demo.features.map((feature, idx) => (
                    <li key={idx} className={`text-sm pl-6 relative ${index % 2 === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className={`absolute left-0 top-0 ${index % 2 === 0 ? 'text-white' : 'text-black'}`}>•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-6">
                <p className={`text-xs ${index % 2 === 0 ? 'text-gray-500' : 'text-gray-500'}`}>
                  {demo.tech}
                </p>
              </div>
              
              <Link
                href="/contact"
                className={`btn ${
                  index % 2 === 0 
                    ? 'btn-primary' 
                    : 'btn-dark'
                }`}
              >
                Discuss Similar Project
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="section section--white">
        <div className="section-container text-center">
          <h2 className="mb-lg">Ready to build something amazing?</h2>
          <p className="text-large mb-2xl max-w-3xl mx-auto">
            Every project is unique. Let&apos;s discuss how we can create a custom solution for your business.
          </p>
          <Link href="/contact" className="btn btn-dark">
            Start Your Project
          </Link>
        </div>
      </section>
    </Layout>
  );
}
