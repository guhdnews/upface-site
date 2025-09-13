import Layout from '../components/Layout';
import Link from 'next/link';


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
              <Link href="/services" className="btn btn-secondary">
                View Services
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

      {/* Our Services Section */}
      <section className="section section--black">
        <div className="section-container">
          <div className="text-center mb-2xl">
            <h2>Our Services</h2>
            <p className="text-large">
              Comprehensive solutions for your business growth
            </p>
          </div>
          
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Web Development</h3>
              <p className="text-large">
                Modern, lightning-fast websites built with the latest technologies to drive your business forward.
              </p>
            </div>
            
            <div className="feature-card">
              <h3>Mobile Applications</h3>
              <p className="text-large">
                Native iOS and Android apps that engage customers and streamline your business operations.
              </p>
            </div>
            
            <div className="feature-card">
              <h3>Custom Solutions</h3>
              <p className="text-large">
                Tailored systems and integrations built specifically for your unique business needs.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/services" className="btn btn-primary">
              View All Services
            </Link>
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
