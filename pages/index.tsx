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
      <section className="section--hero section--black">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1>
              Modern websites
              <br />
              that drive results
            </h1>
            
            <p className="text-large mb-8 max-w-2xl mx-auto">
              We create high-performance websites and applications that help businesses grow, engage customers, and increase revenue.
            </p>
            
            <div className="btn-group justify-center">
              <Link href="/contact" className="btn btn-primary">
                Get Started
              </Link>
              <Link href="/demos" className="btn btn-secondary">
                View Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="feature-grid">
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
            <h3>{feature.title}</h3>
            <p className="text-large">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Our Work Section */}
      <section className="section section--black">
        <div className="section-container">
          <div className="text-center mb-2xl">
            <h2>Our Work</h2>
            <p className="text-large">
              Real solutions for real businesses
            </p>
          </div>
          
          <div>
            {demoProjects.map((project, index) => (
              <div key={index} className="two-column">
                <div className="column-left">
                  <h3>{project.title}</h3>
                  <p className="text-large mb-lg">
                    {project.description}
                  </p>
                  <ul className="mb-lg">
                    {project.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                  <Link href="/demos" className="btn btn-primary">
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
      </section>

      {/* CTA Section */}
      <section className="section section--white">
        <div className="section-container text-center">
          <div className="max-w-3xl mx-auto">
            <h2>
              Ready to get started?
            </h2>
            <p className="text-large mb-8">
              Let&apos;s build something exceptional together.
            </p>
            <div className="btn-group justify-center">
              <Link href="/contact" className="btn btn-dark">
                Start a Project
              </Link>
              <Link href="/packages" className="btn btn-dark">
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
