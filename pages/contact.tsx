import Layout from '../components/Layout';
import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' });

  return (
    <Layout title="Contact - Upface">
      <div className="content-block">
        <div className="section-container">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-light text-white mb-8">Contact</h1>
            <p className="text-2xl text-gray-400 font-light max-w-3xl mx-auto">
              Tell us about your project. We&apos;ll reply within 24 hours.
            </p>
          </div>

          <form className="max-w-3xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input className="bg-black border border-gray-700 px-4 py-4 text-white" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              <input className="bg-black border border-gray-700 px-4 py-4 text-white" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            </div>
            <select className="w-full bg-black border border-gray-700 px-4 py-4 text-white" value={form.service} onChange={e=>setForm({...form,service:e.target.value})}>
              <option value="">Select a service</option>
              <option>Web Development</option>
              <option>Mobile Apps</option>
              <option>Custom Solutions</option>
              <option>Site Audit</option>
              <option>Maintenance</option>
            </select>
            <textarea className="w-full bg-black border border-gray-700 px-4 py-4 text-white min-h-40" placeholder="Message" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} />
            <div className="text-center">
              <button type="button" className="btn-primary inline-block">Send message</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
