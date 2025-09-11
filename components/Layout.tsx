import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';
import Script from 'next/script';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export default function Layout({ 
  children, 
  title = 'Upface - Modern Websites for Local Businesses',
  description = 'Empowering local businesses with modern, high-performance websites and applications. Fast turnaround, competitive pricing, and ongoing support.',
  keywords = 'web development, local business websites, mobile apps, restaurant websites, construction websites, modern web design',
  canonicalUrl,
  ogImage = '/assets/upface-og-image.png'
}: LayoutProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://upface.dev';
  const fullCanonicalUrl = canonicalUrl || siteUrl;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Upface",
    "description": "Modern websites and applications for local businesses",
    "url": siteUrl,
    "logo": `${siteUrl}/assets/upface-logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-UPFACE",
      "contactType": "Customer Service",
      "email": "hello@upface.dev"
    },
    "sameAs": [
      "https://twitter.com/upfacedev",
      "https://linkedin.com/company/upface"
    ],
    "areaServed": "United States",
    "serviceType": "Web Development Services"
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Upface" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={fullCanonicalUrl} />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={fullCanonicalUrl} />
        <meta property="og:image" content={fullOgImage} />
        <meta property="og:site_name" content="Upface" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={fullOgImage} />
        <meta name="twitter:creator" content="@upfacedev" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      
      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
