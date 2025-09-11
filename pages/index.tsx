import Layout from '../components/Layout';
import Link from 'next/link';

const demoProjects = [
  {
    title: 'Bella Vista Restaurant',
    category: 'Restaurant Website',
    description: 'Modern restaurant site with online ordering, menu showcase, and reservation system.',
    image: '/assets/demo-restaurant-1.png',
    features: ['Online Ordering', 'Reservation System', 'Menu Display', 'Mobile Responsive']
  },
  {
    title: 'Elite Construction',
    category: 'Construction Website',
    description: 'Professional construction company site with project gallery and quote system.',
    image: '/assets/demo-construction-1.png',
    features: ['Project Gallery', 'Quote Calculator', 'Team Profiles', 'Client Testimonials']
  },
  {
    title: 'FreshClean Pro',
    category: 'Cleaning Service App',
    description: 'Full-service cleaning app with booking, tracking, and customer management.',
    image: '/assets/demo-cleaning-app.png',
    features: ['Online Booking', 'Service Tracking', 'Payment Processing', 'Customer Portal']
  }
];

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="content-block" style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div className="section-container flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-7xl md:text-9xl font-light text-white mb-12 tracking-tight leading-tight">
              Digital solutions
              <br />
              for local business
            </h1>
            
            <p className="text-2xl text-gray-400 mb-16 font-light leading-relaxed max-w-4xl mx-auto">
              We build exceptional digital experiences for restaurants, construction companies, and service businesses.
            </p>
            
            <div className="flex justify-center gap-6">
              <Link
                href="/contact"
                className="btn-primary inline-block text-center"
              >
                Get Started
              </Link>
              <Link
                href="/demos"
                className="btn-secondary inline-block text-center"
              >
                View Work
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Value Propositions */}
      <div className="feature-grid">
        {[
          {
            title: 'Lightning Fast',
            description: 'Sites built for speed with modern frameworks and optimized performance'
          },
          {
            title: 'Mobile First', 
            description: 'Responsive designs that look perfect on every device and screen size'
          },
          {
            title: 'Secure & Reliable',
            description: 'Enterprise-level security with 99.9% uptime guarantee'
          }
        ].map((feature, index) => (
          <div key={index} className="feature-card">
            <h3 className="text-3xl font-light text-white mb-6">{feature.title}</h3>
            <p className="text-lg text-gray-400 font-light leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Our Work Section */}
      <div className="content-block">
        <div className="section-container">
          <div className="text-center mb-24">
            <h2 className="text-6xl font-light text-white mb-8">Our Work</h2>
            <p className="text-2xl text-gray-400 font-light max-w-3xl mx-auto">
              Real solutions for real businesses
            </p>
          </div>
          
          <div className="space-y-16">
            {demoProjects.map((project, index) => (
              <div key={index} className="two-column">
                <div className="column-left">
                  <h3 className="text-4xl font-light text-white mb-6">
                    {project.title}
                  </h3>
                  <p className="text-lg text-gray-400 font-light mb-8 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="space-y-3 mb-8">
                    {project.features.map((feature, idx) => (
                      <div key={idx} className="text-gray-300 font-light flex items-center">
                        <span className="text-white mr-4">•</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/demos"
                    className="btn-primary inline-block"
                  >
                    View Project
                  </Link>
                </div>
                
                <div className="column-right">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500 text-lg">Project Preview</p>
                  </div>
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
            <h2 className="text-6xl font-light text-black mb-8">
              Ready to get started?
            </h2>
            <p className="text-2xl text-gray-600 mb-16 font-light">
              Let&apos;s build something exceptional together.
            </p>
            <div className="flex justify-center gap-6">
              <Link
                href="/contact"
                className="btn-dark inline-block text-center"
              >
                Start a Project
              </Link>
              <Link
                href="/packages"
                className="bg-transparent border-2 border-black text-black px-8 py-4 font-medium hover:bg-black hover:text-white transition-colors inline-block text-center"
              >
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
