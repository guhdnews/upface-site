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
      <section className="section section--black">
        <div className="section-container text-center">
          <h1>About Upface</h1>
          <p className="text-large">
            We believe every local business deserves enterprise-quality digital solutions. Founded in 2024, Upface bridges the gap between what local businesses need and what they can access.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="two-column">
        <div className="column-left">
          <h2>Our Mission</h2>
          <p className="text-large mb-lg">
            To democratize exceptional digital experiences for local businesses. We take the same technologies and methodologies used by Fortune 500 companies and make them accessible to restaurants, construction companies, salons, and service providers.
          </p>
          <p className="text-gray-400">
            Every local business has the potential to compete at the highest level online. Our job is to unlock that potential.
          </p>
        </div>
        <div className="column-right">
          <h2>Why We&apos;re Different</h2>
          <p className="text-large mb-lg">
            We&apos;re not just another web development agency. We&apos;re specialists who exclusively focus on local businesses, understanding their unique challenges, customer behaviors, and growth opportunities.
          </p>
          <p className="text-gray-500">
            While others treat local businesses as small accounts, we treat them as our primary focus, delivering the same quality and attention you&apos;d expect from top-tier agencies.
          </p>
        </div>
      </section>

      {/* Principles Section */}
      <section className="section section--black">
        <div className="section-container">
          <div className="text-center mb-2xl">
            <h2>Our Principles</h2>
          </div>
          
          <div className="feature-grid">
            {principles.map((principle) => (
              <div key={principle.title} className="feature-card">
                <h3>{principle.title}</h3>
                <p className="text-large">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section section--white">
        <div className="section-container">
          <div className="text-center mb-2xl">
            <h2>Our Journey</h2>
            <p className="text-large">
              From identifying the problem to building the solution
            </p>
          </div>
          
          <div className="max-width-xl space-y-xl">
            {timeline.map((item) => (
              <div key={item.title} className="flex items-start gap-lg">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-gray-500 font-medium">{item.year}</span>
                </div>
                <div className="flex-grow">
                  <h3 className="mb-sm">{item.title}</h3>
                  <p className="text-large text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section--black">
        <div className="section-container text-center">
          <h2 className="mb-lg">Ready to work together?</h2>
          <p className="text-large mb-2xl max-w-3xl mx-auto">
            Let&apos;s discuss how we can help transform your business with a modern digital presence.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </section>
    </Layout>
  );
}
