import React from 'react';
import ComingSoonBanner from '../components/ComingSoonBanner.jsx';

export function Affiliate() {
  return (
    <ComingSoonBanner
      featureLabel="Affiliate Program"
      title="Earn 30% Per Referral"
      description="Our affiliate program is launching soon. Sign up for early access and be first in line to start earning commissions on every referral — no cap, no minimum, instant payouts."
    />
  );
}

export function Account() {
  return (
    <ComingSoonBanner
      featureLabel="Account Portal"
      title="Your Account Dashboard"
      description="A personal account portal is coming — manage your purchases, download history, license keys, and profile all in one place. Sign up to be notified when it launches."
    />
  );
}
