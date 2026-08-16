import React from 'react';

function LegalPage({ title, badge, badgeColor = 'badge-primary', lastUpdated = 'August 2026', children }) {
  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <span className={`badge ${badgeColor}`} style={{ marginBottom: '12px' }}>Legal</span>
          <h1>{title}</h1>
          <p>Last updated: {lastUpdated}</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="glass" style={{ padding: '48px' }}>
            {children}
          </div>
        </div>
      </section>
    </>
  );
}

const H = ({ children }) => <h3 style={{ color: 'white', marginTop: '32px', marginBottom: '12px', fontSize: '18px' }}>{children}</h3>;
const P = ({ children }) => <p style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '16px' }}>{children}</p>;
const Li = ({ children }) => <li style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '8px', color: 'var(--text-muted)' }}>{children}</li>;

export function Privacy() {
  return (
    <LegalPage title="Privacy Policy" badgeColor="badge-primary">
      <P>Digital Product Studio ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit <strong style={{ color: 'white' }}>digitalproductstudio.in</strong> or make a purchase.</P>
      <H>1. Information We Collect</H>
      <P>We collect information you provide directly, including:</P>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <Li>Name and email address (for purchase and download delivery)</Li>
        <Li>Payment information (processed securely by our payment provider — we do not store card data)</Li>
        <Li>Support enquiries and communications</Li>
        <Li>Newsletter subscription data (opt-in only)</Li>
      </ul>
      <H>2. How We Use Your Information</H>
      <P>Your information is used solely to: deliver your purchased products, process refunds, provide customer support, and (with your consent) send product updates and newsletter content. We do not sell, rent, or share your personal data with third parties for marketing purposes.</P>
      <H>3. Cookies</H>
      <P>We use strictly necessary cookies to operate the site, and optional analytics cookies (e.g., anonymized visit data) to improve the user experience. You can disable cookies in your browser settings at any time.</P>
      <H>4. Data Retention</H>
      <P>We retain your purchase records for up to 5 years for tax and legal compliance purposes. Support communication records are retained for 2 years. You may request deletion of your data at any time by contacting us.</P>
      <H>5. Your Rights</H>
      <P>Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <strong style={{ color: 'var(--primary-light)' }}>privacy@digitalproductstudio.in</strong>.</P>
      <H>6. Contact</H>
      <P>For any privacy-related questions, contact: <strong style={{ color: 'var(--primary-light)' }}>privacy@digitalproductstudio.in</strong></P>
    </LegalPage>
  );
}

export function Terms() {
  return (
    <LegalPage title="Terms of Service" badgeColor="badge-cyan">
      <P>These Terms of Service govern your use of the Digital Product Studio website and your purchase of any digital products. By accessing the site or making a purchase, you agree to these terms.</P>
      <H>1. Digital Product License</H>
      <P>Upon purchase, you receive a non-exclusive, non-transferable license to use the digital product according to the license tier selected. You may not resell, redistribute, or claim authorship of our products.</P>
      <H>2. Instant Downloads</H>
      <P>All products are digital goods delivered via secure download links. By completing a purchase, you acknowledge that delivery is immediate and digital, and you waive your right to cancel once the download has been accessed.</P>
      <H>3. Prohibited Uses</H>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <Li>Reselling or redistributing our products without written permission</Li>
        <Li>Using our products to train AI models without explicit consent</Li>
        <Li>Removing copyright notices or attribution from any product files</Li>
        <Li>Using our products in illegal, defamatory, or harmful contexts</Li>
      </ul>
      <H>4. Limitation of Liability</H>
      <P>Digital Product Studio shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our products. Our total liability is limited to the amount you paid for the product in question.</P>
      <H>5. Changes to Terms</H>
      <P>We reserve the right to update these Terms at any time. Continued use of the site after changes constitutes acceptance of the new Terms.</P>
      <H>6. Governing Law</H>
      <P>These Terms are governed by and construed in accordance with applicable law. Any disputes will be resolved in the relevant courts of jurisdiction.</P>
    </LegalPage>
  );
}

export function RefundPolicy() {
  return (
    <LegalPage title="Refund Policy" badgeColor="badge-emerald">
      <P>We stand behind every product we sell with a <strong style={{ color: 'white' }}>7-Day Satisfaction Guarantee</strong>. If you're not happy with a purchase for any reason, we'll refund you — no questions asked.</P>
      <H>Refund Eligibility</H>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <Li>Request submitted within 7 days of purchase date</Li>
        <Li>Applicable to all digital product purchases</Li>
        <Li>One refund per customer per product (re-purchases after refund are not eligible)</Li>
      </ul>
      <H>How to Request a Refund</H>
      <P>Submit a refund request via our <a href="/support" style={{ color: 'var(--primary-light)' }}>Support page</a> or email <strong style={{ color: 'var(--primary-light)' }}>support@digitalproductstudio.in</strong>. Include your order ID and the email address used at purchase. Refunds are processed within 3–5 business days and will appear on your original payment method.</P>
      <H>Non-Refundable Circumstances</H>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <Li>Requests made more than 7 days after purchase</Li>
        <Li>Products that have been resold or distributed</Li>
        <Li>Bundle refund requests where all items have been individually downloaded and used commercially</Li>
      </ul>
      <H>Questions?</H>
      <P>Contact us at <strong style={{ color: 'var(--primary-light)' }}>support@digitalproductstudio.in</strong> — we're always happy to help.</P>
    </LegalPage>
  );
}

export function Licensing() {
  return (
    <LegalPage title="Licensing" badgeColor="badge-purple">
      <P>All Digital Product Studio products are sold under one of three license tiers. Please review carefully to ensure you select the correct license for your use case.</P>

      {[
        {
          name: 'Standard License', price: 'Included with every purchase', color: 'var(--primary)',
          uses: ['Personal use', 'Single business use', 'Internal projects', 'Client work (1 client)'],
          notAllowed: ['Multiple clients', 'Templates sold as-is', 'Sublicensing'],
        },
        {
          name: 'Studio License', price: '$49 add-on (contact us)', color: 'var(--purple)',
          uses: ['Up to 5 client projects', 'Agency/freelancer use', 'Multiple business brands you own', 'Internal team distribution'],
          notAllowed: ['Reselling the raw product', 'Sublicensing to others'],
        },
        {
          name: 'Enterprise License', price: '$149 add-on (contact us)', color: 'var(--emerald)',
          uses: ['Unlimited client projects', 'Large-scale team distribution', 'Commercial use at scale', 'White-label permitted (with agreement)'],
          notAllowed: ['Reselling or redistribution as original product'],
        },
      ].map(({ name, price, color, uses, notAllowed }) => (
        <div key={name} className="glass" style={{ padding: '24px', marginTop: '24px', borderLeft: `3px solid ${color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ color: 'white', fontSize: '18px' }}>{name}</h4>
            <span className="badge badge-primary" style={{ fontSize: '11px' }}>{price}</span>
          </div>
          <div className="grid-2" style={{ gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>✓ Permitted</div>
              <ul style={{ paddingLeft: '16px' }}>
                {uses.map(u => <Li key={u}>{u}</Li>)}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>✗ Not Permitted</div>
              <ul style={{ paddingLeft: '16px' }}>
                {notAllowed.map(u => <Li key={u}>{u}</Li>)}
              </ul>
            </div>
          </div>
        </div>
      ))}

      <H>Questions about Licensing?</H>
      <P>Contact <strong style={{ color: 'var(--primary-light)' }}>licensing@digitalproductstudio.in</strong> for custom arrangements, PLR licensing, or enterprise agreements.</P>
    </LegalPage>
  );
}
