import Layout from '../components/Layout';
import Link from 'next/link';

export default function Packages() {
  const packages = [
    { 
      name: 'Essentials',
      description: 'Perfect for small local businesses ready to establish a strong online presence.',
      timeline: '2-3 weeks',
      features: [
        'Custom responsive website design',
        'Up to 5 pages (Home, About, Services, Contact, etc.)',
        'Mobile-first responsive design',
        'Contact forms with email integration',
        'Basic SEO optimization',
        'Google Analytics setup',
        '3 months of free support',
        'Social media integration',
        'SSL certificate and security setup'
      ],
      ideal: 'Restaurants, salons, local services, consultants'
    },
    { 
      name: 'Professional',
      description: 'Comprehensive solution for growing businesses that need advanced features.',
      timeline: '3-4 weeks', 
      features: [
        'Everything in Essentials package',
        'Up to 10 custom pages',
        'Advanced booking/reservation system', 
        'Customer portal and accounts',
        'Payment processing integration',
        'Inventory management system',
        'Email marketing integration',
        'Advanced SEO and local search optimization',
        'Performance optimization',
        '6 months of priority support'
      ],
      ideal: 'Construction companies, gyms, auto shops, retail stores'
    },
    { 
      name: 'Enterprise',
      description: 'Full-scale digital transformation for established businesses seeking maximum impact.',
      timeline: '4-6 weeks',
      features: [
        'Everything in Professional package',
        'Native mobile app (iOS & Android)',
        'Custom workflow automation',
        'Advanced analytics and reporting',
        'Multi-location management',
        'Third-party API integrations',
        'Custom admin dashboard',
        'Staff management and scheduling tools',
        'Loyalty program implementation',
        '12 months of dedicated support',
        'Monthly performance consultations'
      ],
      ideal: 'Multi-location businesses, franchises, large service providers'
    },
  ];

  return (
    <Layout title="Packages - Upface">
      <section className="section section--black">
        <div className="section-container">
          <div className="text-center mb-2xl">
            <h1>Packages</h1>
            <p className="text-large">
              Transparent, comprehensive solutions tailored to your business size and goals.
            </p>
          </div>
          
          <div className="space-y-xl">
            {packages.map((pkg) => (
              <div key={pkg.name} className="border border-gray-800 max-w-5xl mx-auto">
                <div className="p-xl">
                  <div className="text-center mb-xl">
                    <h2 className="mb-md">{pkg.name}</h2>
                    <p className="text-large mb-lg">{pkg.description}</p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-md text-gray-500">
                      <span>Timeline: {pkg.timeline}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Ideal for: {pkg.ideal}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
                    <div>
                      <h3 className="mb-lg">What&apos;s included</h3>
                      <ul className="mb-lg">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-col justify-center items-center text-center">
                      <div className="mb-lg">
                        <p className="text-large mb-lg">
                          Ready to transform your business? Let&apos;s discuss how this package can work for you.
                        </p>
                      </div>
                      
                      <Link href="/contact" className="btn btn-primary">
                        Get Quote
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="section section--white">
        <div className="section-container text-center">
          <h2 className="mb-lg">Custom Solutions</h2>
          <p className="text-large mb-2xl max-w-3xl mx-auto">
            Need something different? We create fully custom solutions tailored to your unique requirements.
          </p>
          <Link href="/contact" className="btn btn-dark">
            Discuss Custom Project
          </Link>
        </div>
      </section>
    </Layout>
  );
}
