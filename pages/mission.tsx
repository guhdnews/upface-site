import Layout from '../components/Layout';

export default function Mission() {
  const values = [
    {
      title: 'Excellence',
      description: 'We deliver products that rival the quality of the world’s best technology companies, bringing enterprise-grade solutions to local businesses.'
    },
    {
      title: 'Speed',
      description: 'Time is critical for growing businesses. We deliver exceptional results in weeks, not months, without compromising quality.'
    },
    {
      title: 'Understanding',
      description: 'Local businesses have unique challenges. We deeply understand these needs and create solutions that truly serve them.'
    },
    {
      title: 'Accessibility',
      description: 'Advanced technology shouldn’t be limited to large corporations. We make cutting-edge solutions accessible to businesses of all sizes.'
    }
  ];

  return (
    <Layout title="Mission - Upface">
      <section className="py-32 bg-black">
        <div className="section-container">
          <div className="text-center mb-24">
            <h1 className="text-5xl md:text-7xl font-light text-white mb-12">Our Mission</h1>
            <div className="max-w-4xl mx-auto">
              <p className="text-2xl md:text-3xl text-gray-300 font-light leading-relaxed mb-16">
                Empower local businesses with simple, innovative, and high-performance digital experiences—delivered at warp speed and crafted to feel as refined as products from the world’s best technology companies.
              </p>
            </div>
          </div>
          
          <div className="mb-32">
            <h2 className="text-4xl font-light text-white text-center mb-16">Why This Matters</h2>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xl text-gray-400 font-light leading-relaxed mb-8">
                Local businesses are the backbone of our communities, yet they’re often left behind in the digital revolution. While tech giants have unlimited resources for digital innovation, small businesses struggle with outdated websites, manual processes, and missed opportunities.
              </p>
              <p className="text-xl text-gray-400 font-light leading-relaxed">
                We exist to level the playing field. Every restaurant, construction company, salon, and service business deserves the same caliber of digital tools that drive success for major corporations.
              </p>
            </div>
          </div>
          
          <div className="mb-32">
            <h2 className="text-4xl font-light text-white text-center mb-16">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <h3 className="text-2xl font-medium text-white mb-6">{value.title}</h3>
                  <p className="text-gray-400 font-light leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-4xl font-light text-white mb-8">The Future We’re Building</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-400 font-light leading-relaxed mb-12">
                We envision a world where every local business has access to the same powerful digital tools that drive success for the world’s largest companies. Where a family restaurant can compete with chains, where local services can reach customers as effectively as national brands, and where great businesses thrive regardless of their technical resources.
              </p>
              <p className="text-xl text-gray-400 font-light leading-relaxed">
                This is more than web development—it’s about strengthening local economies and empowering entrepreneurs to focus on what they do best while technology handles the rest.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
