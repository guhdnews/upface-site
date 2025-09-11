import Layout from '../components/Layout';
import Link from 'next/link';

export default function About() {
  const principles = [
    {
      title: 'Local Focus',
      description: 'We exclusively serve local businesses because we understand their unique challenges and opportunities.'
    },
    {
      title: 'Quality First', 
      description: 'Every project receives the same level of attention and craftsmanship, regardless of size or budget.'
    },
    {
      title: 'Real Results',
      description: 'We build solutions that directly impact your bottom line, not just beautiful websites that sit idle.'
    }
  ];

  const timeline = [
    { 
      title: 'The Vision', 
      desc: 'Identified the gap between enterprise-quality digital solutions and what local businesses could access.',
      year: '2024' 
    },
    { 
      title: 'Research & Development', 
      desc: 'Spent months understanding local business needs, building demos, and refining our approach.',
      year: '2024 Q4' 
    },
    { 
      title: 'Launch', 
      desc: 'Officially launched Upface with a mission to democratize exceptional digital experiences.',
      year: '2025' 
    },
    { 
      title: 'Growth', 
      desc: 'Expanding our services and continuing to serve local businesses with cutting-edge solutions.',
      year: '2025+' 
    },
  ];

  return (
    <Layout title="About - Upface">
      {/* Hero Section */}
      <div className="content-block">
        <div className="section-container">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-light text-white mb-8">About Upface</h1>
            <p className="text-2xl text-gray-400 font-light max-w-4xl mx-auto">
              We believe every local business deserves enterprise-quality digital solutions. Founded in 2024, Upface bridges the gap between what local businesses need and what they can access.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="two-column">
        <div className="column-left">
          <h2 className="text-5xl font-light text-white mb-8">Our Mission</h2>
          <p className="text-xl text-gray-300 font-light leading-relaxed mb-8">
            To democratize exceptional digital experiences for local businesses. We take the same technologies and methodologies used by Fortune 500 companies and make them accessible to restaurants, construction companies, salons, and service providers.
          </p>
          <p className="text-lg text-gray-400 font-light leading-relaxed">
            Every local business has the potential to compete at the highest level online. Our job is to unlock that potential.
          </p>
        </div>
        <div className="column-right">
          <h2 className="text-5xl font-light text-black mb-8">Why We&apos;re Different</h2>
          <p className="text-xl text-gray-600 font-light leading-relaxed mb-8">
            We&apos;re not just another web development agency. We&apos;re specialists who exclusively focus on local businesses, understanding their unique challenges, customer behaviors, and growth opportunities.
          </p>
          <p className="text-lg text-gray-500 font-light leading-relaxed">
            While others treat local businesses as small accounts, we treat them as our primary focus, delivering the same quality and attention you&apos;d expect from top-tier agencies.
          </p>
        </div>
      </div>

      {/* Principles Section */}
      <div className="content-block">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-white mb-8">Our Principles</h2>
          </div>
          
          <div className="feature-grid">
            {principles.map((principle) => (
              <div key={principle.title} className="feature-card">
                <h3 className="text-3xl font-light text-white mb-6">{principle.title}</h3>
                <p className="text-lg text-gray-300 font-light leading-relaxed">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="content-block-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-black mb-8">Our Journey</h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              From identifying the problem to building the solution
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-12">
            {timeline.map((item) => (
              <div key={item.title} className="flex items-start">
                <div className="flex-shrink-0 w-24 text-right mr-8">
                  <span className="text-lg font-medium text-gray-500">{item.year}</span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-light text-black mb-3">{item.title}</h3>
                  <p className="text-lg text-gray-600 font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="content-block">
        <div className="section-container">
          <div className="text-center">
            <h2 className="text-5xl font-light text-white mb-8">Ready to work together?</h2>
            <p className="text-xl text-gray-400 font-light mb-12 max-w-3xl mx-auto">
              Let&apos;s discuss how we can help transform your business with a modern digital presence.
            </p>
            <Link
              href="/contact"
              className="btn-primary inline-block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
