import Layout from '../components/Layout';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const services = [
  {
    title: 'Web Development',
    description: 'Transform your online presence with modern, lightning-fast websites built using the latest technologies.',
    features: [
      'Responsive design that works flawlessly on all devices',
      'SEO optimization for maximum search visibility',
      'Lightning-fast loading times under 2 seconds',
      'Content management systems for easy updates',
      'E-commerce integration with secure payment processing',
      'Analytics and performance monitoring setup'
    ],
    process: 'We start with your business goals, create custom designs, develop with modern frameworks, and launch with full optimization.',
    cta: 'Get Started'
  },
  {
    title: 'Mobile Applications',
    description: 'Engage customers directly with native iOS and Android applications designed for your business.',
    features: [
      'Native iOS and Android app development',
      'Push notifications for customer engagement',
      'Offline functionality for uninterrupted service',
      'In-app booking and reservation systems',
      'Loyalty program integration with rewards',
      'Real-time order tracking and updates'
    ],
    process: 'From concept to app store deployment, we handle design, development, testing, and ongoing maintenance.',
    cta: 'Learn More'
  },
  {
    title: 'Custom Solutions',
    description: 'Unique business challenges require tailored solutions built specifically for your workflows.',
    features: [
      'Custom quote and estimate calculators',
      'Client portal and dashboard development',
      'Third-party API integrations',
      'Automated workflow and booking systems',
      'Custom reporting and analytics tools',
      'Legacy system modernization'
    ],
    process: 'We analyze your specific needs, design custom solutions, and integrate seamlessly with your existing operations.',
    cta: 'Discuss Project'
  }
];

export default function Services() {
  return (
    <Layout title="Services - Upface">
      {/* Hero Section */}
      <div className="content-block">
        <div className="section-container">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-light text-white mb-8">Services</h1>
            <p className="text-2xl text-gray-400 font-light max-w-4xl mx-auto">
              Comprehensive digital solutions designed to transform your local business and drive growth.
            </p>
          </div>
        </div>
      </div>

      {/* Services */}
      {services.map((service, index) => (
        <div key={service.title} className="two-column">
          <div className="column-left">
            <h2 className="text-5xl font-light text-white mb-6">{service.title}</h2>
            <p className="text-lg text-gray-300 font-light leading-relaxed mb-8">
              {service.description}
            </p>
            <h3 className="text-2xl font-light text-white mb-6">What we deliver</h3>
            <ul className="space-y-4 text-gray-300 mb-8">
              {service.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-white mr-4">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="column-right">
            <h3 className="text-2xl font-light text-black mb-6">Our process</h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {service.process}
            </p>
            <Link 
              href="/contact" 
              className="btn-dark inline-flex items-center"
            >
              {service.cta}
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      ))}
    </Layout>
  );
}
