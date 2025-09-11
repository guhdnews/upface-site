import Layout from '../components/Layout';
import Link from 'next/link';

export default function Packages() {
  const packages = [
    { 
      name: 'Essentials', 
      features: [
        'Modern website design',
        'Mobile responsive',
        'Contact forms',
        'Basic SEO setup'
      ] 
    },
    { 
      name: 'Professional', 
      features: [
        'Everything in Essentials',
        'Custom functionality',
        'Mobile app integration',
        'Analytics setup',
        'Priority support'
      ] 
    },
    { 
      name: 'Enterprise', 
      features: [
        'Everything in Professional',
        'Advanced integrations',
        'Custom development',
        'Dedicated support',
        'Ongoing maintenance'
      ] 
    },
  ];

  return (
    <Layout title="Packages - Upface">
      <section className="min-h-screen py-32 bg-black">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-24">
            <h1 className="text-5xl md:text-7xl font-light text-white mb-8">Packages</h1>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
              Transparent solutions designed for local businesses.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.name} className="border border-gray-800 p-8">
                <h3 className="text-2xl font-light text-white mb-8">{pkg.name}</h3>
                
                <ul className="space-y-4 mb-12">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="text-gray-400 font-light">
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/contact"
                  className="w-full block text-center bg-white text-black py-4 font-medium hover:bg-gray-100 transition-colors"
                >
                  Inquire
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
