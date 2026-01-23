'use client'

import Link from 'next/link'

export default function SupportPage() {
  return (
    <div className="py-8 animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold mb-3">Support Collective Sense</h1>
      <p className="text-secondary mb-10">
        Help us keep this community running for everyone
      </p>

      {/* The model */}
      <div className="bg-white rounded-3xl p-8 border border-border mb-8">
        <h2 className="text-xl font-semibold mb-4">How we work</h2>
        <div className="space-y-4 text-secondary leading-relaxed">
          <p>
            Collective Sense is run as a <strong className="text-foreground">community project</strong>,
            not a business. We don&apos;t show ads, sell data, or charge for access.
          </p>
          <p>
            The only real cost is the AI that synthesises contributions into collective wisdom.
            Every problem that gets synthesised costs us about <strong className="text-foreground">2p</strong>.
          </p>
          <p>
            We rely on donations from people who find this valuable.
          </p>
        </div>
      </div>

      {/* Impact */}
      <div className="bg-gradient-to-br from-accent to-accent-dark rounded-3xl p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6">Your donation helps</h2>
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-primary mb-1">£1</p>
            <p className="text-secondary text-sm">Synthesises ~50 problems</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-highlight mb-1">£5</p>
            <p className="text-secondary text-sm">Helps ~250 people</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary mb-1">£10/month</p>
            <p className="text-secondary text-sm">Sustains the community</p>
          </div>
        </div>
      </div>

      {/* Donate button */}
      <div className="bg-white rounded-3xl p-8 border border-border mb-8 text-center">
        <h2 className="text-xl font-semibold mb-3">Make a donation</h2>
        <p className="text-secondary mb-6">
          Any amount helps. One-off or monthly - whatever works for you.
        </p>

        {/* Replace this link with your Stripe payment link */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            alert('Donation link coming soon! We are setting up our payment system.')
          }}
          className="inline-block px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all font-medium text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Donate now
        </a>

        <p className="text-sm text-secondary mt-4">
          Secure payment via Stripe
        </p>
      </div>

      {/* Transparency */}
      <div className="bg-white rounded-3xl p-8 border border-border mb-8">
        <h2 className="text-xl font-semibold mb-4">Our promise</h2>
        <ul className="space-y-3">
          <li className="flex gap-3 items-start">
            <span className="text-highlight text-lg">✓</span>
            <p className="text-secondary">
              <strong className="text-foreground">100% of donations</strong> go towards running costs
            </p>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-highlight text-lg">✓</span>
            <p className="text-secondary">
              <strong className="text-foreground">No salaries</strong> - this is a volunteer project
            </p>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-highlight text-lg">✓</span>
            <p className="text-secondary">
              <strong className="text-foreground">Open about costs</strong> - we&apos;ll share how funds are used
            </p>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-highlight text-lg">✓</span>
            <p className="text-secondary">
              <strong className="text-foreground">Always free to use</strong> - donations keep it that way
            </p>
          </li>
        </ul>
      </div>

      {/* Alternative ways to help */}
      <div className="text-center py-6">
        <h2 className="text-lg font-medium mb-3">Other ways to help</h2>
        <p className="text-secondary mb-4">
          Can&apos;t donate? No problem. The best way to support us is to{' '}
          <Link href="/contribute" className="text-primary hover:text-primary-dark font-medium">
            contribute thoughtfully
          </Link>{' '}
          and{' '}
          <span className="text-primary font-medium">spread the word</span>.
        </p>
      </div>
    </div>
  )
}
