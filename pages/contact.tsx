import Layout from '../components/Layout';
import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', service: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use deployed Cloud Function for form processing
      const response = await fetch('https://us-central1-upface-site.cloudfunctions.net/processContactForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          company: form.company || undefined,
          message: `Service interest: ${form.service}\n\n${form.message}`,
          source: 'contact_form'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }
      
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', company: '', service: '', message: '' });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('There was an error submitting your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Contact - Upface">
      <section className="section section--black">
        <div className="section-container">
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h1>Let&apos;s Build Something Amazing Together</h1>
            <p className="text-large mb-8 max-w-3xl mx-auto">
              Ready to transform your business with a modern digital presence? Tell us about your project and we&apos;ll show you exactly how we can help.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <h3 className="text-xl mb-2">⚡ Fast Response</h3>
                <p className="text-gray-400">We reply within 24 hours with a detailed proposal</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl mb-2">💡 Free Consultation</h3>
                <p className="text-gray-400">Get expert advice on your project at no cost</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl mb-2">🎯 Custom Solutions</h3>
                <p className="text-gray-400">Tailored specifically to your business needs</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {submitted ? (
              <div className="bg-gray-900 p-8 border border-gray-700 rounded-lg text-center">
                <h2 className="text-green-400 mb-4">✅ Thank You!</h2>
                <p className="text-large mb-4">We&apos;ve received your inquiry and will get back to you within 24 hours.</p>
                <button 
                  onClick={() => setSubmitted(false)} 
                  className="btn btn-primary"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-gray-900 p-8 border border-gray-700 rounded-lg">
                <h2 className="text-center mb-6">Get Your Free Quote</h2>
              
                <div className="form-grid form-grid--two mb-4">
                  <input 
                    className="form-input" 
                    placeholder="Your Name" 
                    value={form.name} 
                    onChange={e=>setForm({...form,name:e.target.value})} 
                    required
                    disabled={isSubmitting}
                  />
                  <input 
                    className="form-input" 
                    placeholder="Email Address" 
                    type="email" 
                    value={form.email} 
                    onChange={e=>setForm({...form,email:e.target.value})} 
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-grid form-grid--two mb-4">
                  <input 
                    className="form-input" 
                    placeholder="Phone (optional)" 
                    type="tel" 
                    value={form.phone} 
                    onChange={e=>setForm({...form,phone:e.target.value})} 
                    disabled={isSubmitting}
                  />
                  <input 
                    className="form-input" 
                    placeholder="Company (optional)" 
                    value={form.company} 
                    onChange={e=>setForm({...form,company:e.target.value})} 
                    disabled={isSubmitting}
                  />
                </div>
              
                <div className="form-group">
                  <select 
                    className="form-select" 
                    value={form.service} 
                    onChange={e=>setForm({...form,service:e.target.value})}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">What service interests you most?</option>
                    <option value="website">New Website</option>
                    <option value="mobile">Mobile App</option>
                    <option value="ecommerce">E-commerce Platform</option>
                    <option value="custom">Custom Solution</option>
                    <option value="redesign">Website Redesign</option>
                    <option value="maintenance">Maintenance & Support</option>
                  </select>
                </div>
              
                <div className="form-group">
                  <textarea 
                    className="form-textarea" 
                    placeholder="Tell us about your business and what you're looking to achieve. The more details you provide, the better we can help you." 
                    value={form.message} 
                    onChange={e=>setForm({...form,message:e.target.value})} 
                    rows={6}
                    disabled={isSubmitting}
                  />
                </div>
              
                <div className="text-center mb-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary w-full max-w-sm" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Get My Free Quote →'}
                  </button>
                </div>
              
                <p className="text-center text-sm text-gray-500">
                  🔒 Your information is secure. We never share your details.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
