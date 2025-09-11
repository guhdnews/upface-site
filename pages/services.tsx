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
      <section className="section section--black">
        <div className="section-container text-center">
          <h1>Services</h1>
          <p className="text-large">
            Comprehensive digital solutions designed to transform your local business and drive growth.
          </p>
        </div>
      </section>

      {/* Services */}
      {services.map((service) => (
        <section key={service.title} className="two-column">
          <div className="column-left">
            <h2>{service.title}</h2>
            <p className="text-large mb-lg">
              {service.description}
            </p>
            <h3>What we deliver</h3>
            <ul className="mb-lg">
              {service.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="column-right">
            <h3>Our process</h3>
            <p className="text-large mb-lg">
              {service.process}
            </p>
            <Link href="/contact" className="btn btn-dark">
              {service.cta}
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </section>
      ))}
    </Layout>
  );
}
