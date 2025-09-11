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
      <section className="py-32 bg-black">
        <div className="section-container">
          <div className="text-center mb-24">
            <h1 className="text-5xl md:text-7xl font-light text-white mb-8">Packages</h1>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Transparent, comprehensive solutions tailored to your business size and goals.
            </p>
          </div>
          
          <div className="space-y-16">
            {packages.map((pkg) => (
              <div key={pkg.name} className="border border-gray-800 max-w-5xl mx-auto">
                <div className="p-12">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-light text-white mb-4">{pkg.name}</h2>
                    <p className="text-xl text-gray-400 font-light mb-4">{pkg.description}</p>
                    <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
                      <span>Timeline: {pkg.timeline}</span>
                      <span>•</span>
                      <span>Ideal for: {pkg.ideal}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-2xl font-medium text-white mb-6">What&apos;s included</h3>
                      <ul className="space-y-4">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="text-gray-300 font-light flex items-start">
                            <span className="w-2 h-2 bg-white rounded-full mr-4 mt-3 flex-shrink-0"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-col justify-center items-center text-center">
                      <div className="mb-8">
                        <p className="text-gray-400 mb-6 font-light">
                          Ready to transform your business? Let&apos;s discuss how this package can work for you.
                        </p>
                      </div>
                      
                      <Link
                        href="/contact"
                        className="btn-primary inline-block"
                      >
                        Get Quote
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-24">
            <h2 className="text-3xl font-light text-white mb-6">Custom Solutions</h2>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto mb-8">
              Need something different? We create fully custom solutions tailored to your unique requirements.
            </p>
            <Link
              href="/contact"
              className="btn-secondary inline-block"
            >
              Discuss Custom Project
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
