import Layout from '../components/Layout';
import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' });

  return (
    <Layout title="Contact - Upface">
      <div className="content-block">
        <div className="section-container">
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-light text-white mb-8">Contact</h1>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Tell us about your project. We&apos;ll reply within 24 hours.
            </p>
          </div>

          <form className="max-w-2xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input 
                className="w-full bg-black border border-gray-700 px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors" 
                placeholder="Name" 
                value={form.name} 
                onChange={e=>setForm({...form,name:e.target.value})} 
              />
              <input 
                className="w-full bg-black border border-gray-700 px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors" 
                placeholder="Email" 
                type="email" 
                value={form.email} 
                onChange={e=>setForm({...form,email:e.target.value})} 
              />
            </div>
            <select 
              className="w-full bg-black border border-gray-700 px-4 py-4 text-white focus:outline-none focus:border-white transition-colors" 
              value={form.service} 
              onChange={e=>setForm({...form,service:e.target.value})}
            >
              <option value="" className="text-gray-500">Select a service</option>
              <option>Web Development</option>
              <option>Mobile Apps</option>
              <option>Custom Solutions</option>
              <option>Site Audit</option>
              <option>Maintenance</option>
            </select>
            <textarea 
              className="w-full bg-black border border-gray-700 px-4 py-4 text-white placeholder-gray-500 min-h-[120px] focus:outline-none focus:border-white transition-colors resize-vertical" 
              placeholder="Tell us about your project..." 
              value={form.message} 
              onChange={e=>setForm({...form,message:e.target.value})} 
            />
            <div className="text-center pt-6">
              <button type="button" className="btn-primary">Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
