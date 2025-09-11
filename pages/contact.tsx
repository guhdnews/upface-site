import Layout from '../components/Layout';
import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' });

  return (
    <Layout title="Contact - Upface">
      <section className="section section--black">
        <div className="section-container">
          <div className="text-center mb-2xl">
            <h1>Contact</h1>
            <p className="text-large">
              Tell us about your project. We&apos;ll reply within 24 hours.
            </p>
          </div>

          <form className="max-w-2xl mx-auto">
            <div className="form-grid form-grid--two mb-md">
              <input 
                className="form-input" 
                placeholder="Name" 
                value={form.name} 
                onChange={e=>setForm({...form,name:e.target.value})} 
              />
              <input 
                className="form-input" 
                placeholder="Email" 
                type="email" 
                value={form.email} 
                onChange={e=>setForm({...form,email:e.target.value})} 
              />
            </div>
            <div className="form-group">
              <select 
                className="form-select" 
                value={form.service} 
                onChange={e=>setForm({...form,service:e.target.value})}
              >
                <option value="">Select a service</option>
                <option>Web Development</option>
                <option>Mobile Apps</option>
                <option>Custom Solutions</option>
                <option>Site Audit</option>
                <option>Maintenance</option>
              </select>
            </div>
            <div className="form-group">
              <textarea 
                className="form-textarea" 
                placeholder="Tell us about your project..." 
                value={form.message} 
                onChange={e=>setForm({...form,message:e.target.value})} 
              />
            </div>
            <div className="text-center">
              <button type="button" className="btn btn-primary">Send Message</button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
