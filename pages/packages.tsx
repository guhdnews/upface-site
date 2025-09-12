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
    {
      name: 'Custom Solution',
      description: 'Completely tailored solution built from the ground up to meet your specific requirements.',
      timeline: 'Varies by scope',
      features: [
        'Full requirements analysis and consultation',
        'Custom architecture and technology stack',
        'Unlimited pages and features',
        'Advanced integrations and APIs',
        'Custom user interfaces and workflows',
        'Scalable infrastructure setup',
        'Advanced security implementation',
        'Performance optimization and monitoring',
        'Comprehensive testing and QA',
        'Ongoing maintenance and support',
        'Training and documentation'
      ],
      ideal: 'Unique business models, complex workflows, enterprise needs'
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
          
          <div className="space-y-8">
            {packages.map((pkg, index) => (
              <div key={pkg.name} className="border border-gray-800 max-w-5xl mx-auto">
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="mb-4">{pkg.name}</h2>
                    <p className="text-large mb-6 max-w-3xl mx-auto">{pkg.description}</p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-gray-500">
                      <span>Timeline: {pkg.timeline}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Ideal for: {pkg.ideal}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="mb-6 pt-4">What&apos;s included</h3>
                      <ul className="mb-6 space-y-2">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="pl-6 relative">
                            <span className="absolute left-0 top-0">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-col justify-center items-center text-center">
                      <div className="mb-6">
                        <p className="text-large mb-6">
                          {index === 3 ? 
                            "Need something completely unique? Let's discuss your custom requirements." :
                            "Ready to transform your business? Let's discuss how this package can work for you."
                          }
                        </p>
                      </div>
                      
                      <Link href="/contact" className="btn btn-primary">
                        {index === 3 ? 'Request Consultation' : 'Get Quote'}
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
