import Link from 'next/link'

const faqs = [
  {
    question: "What is Collective Sense?",
    answer: "Collective Sense is a platform where you can get advice or opinions from multiple people, synthesised into collective wisdom. Instead of seeing individual responses, you receive a thoughtful synthesis that combines everyone's input into themes, common perspectives, and divergent views."
  },
  {
    question: "How does it work?",
    answer: "You submit a question seeking either advice (for complex life situations) or opinions (for comparisons and everyday choices). Other community members contribute their thoughts anonymously. Once enough people have contributed, AI synthesises all the responses into a comprehensive summary that captures the collective wisdom."
  },
  {
    question: "What's the difference between Advice and Opinion?",
    answer: "Advice is for complex situations where you need thoughtful guidance - things like career decisions, relationship challenges, or life dilemmas. You provide detailed context about your situation. Opinions are for simpler comparisons or preferences - like 'Is X better than Y?' or 'Is it worth getting Z?' - where you want to know what people generally think."
  },
  {
    question: "Why can't I see individual responses?",
    answer: "This is by design. When people know their individual response won't be displayed, they write more honestly and thoughtfully - less performatively. The synthesis captures what matters: common themes, where people agreed, where they disagreed, and important considerations. This gives you more useful insight than scrolling through dozens of individual opinions."
  },
  {
    question: "How many contributions are needed for a synthesis?",
    answer: "Currently, 5 contributions are needed before a synthesis is generated. This ensures there's enough diverse input to create meaningful collective wisdom while not making you wait too long."
  },
  {
    question: "How is the synthesis created?",
    answer: "Once enough contributions are gathered, AI (Claude) reads all the anonymous responses and synthesises them into a structured summary. It identifies common themes, highlights where contributors agreed and disagreed, notes important considerations, and flags any cautions that were raised. The AI doesn't add its own advice - it only synthesises what the community contributed."
  },
  {
    question: "Is my data private?",
    answer: "Your submissions and contributions are stored securely. When you contribute to someone else's question, your response is anonymous - they'll never see that it came from you. Your own submissions are visible only to you (and to others as anonymous questions to contribute to)."
  },
  {
    question: "Why are there no likes, comments, or followers?",
    answer: "Collective Sense is intentionally designed to avoid the engagement patterns of social media. There are no likes because we don't want people writing for approval. There are no followers because this isn't about building an audience. There are no comment threads because we want synthesis, not debate. The focus is entirely on helping and being helped."
  },
  {
    question: "Can I see how my contribution compared to others?",
    answer: "Yes! After a synthesis is complete, you can visit 'My Contributions' to see the problems you contributed to. For completed ones, you can expand to see the collective wisdom alongside your original contribution, so you can reflect on how your thoughts aligned with or differed from the crowd."
  },
  {
    question: "Can I delete my submissions?",
    answer: "Currently, you cannot delete submissions once they've received contributions, as this would affect the synthesis. If you have concerns about a specific submission, please contact us."
  },
  {
    question: "Is Collective Sense free?",
    answer: "Yes, Collective Sense is free to use. The platform runs on community goodwill and contributions. If you'd like to support the running costs, you can visit our Support page."
  },
  {
    question: "What if someone submits harmful content?",
    answer: "All contributions are checked for harmful content before being included in a synthesis. We want this to be a safe, helpful space for everyone. If you encounter anything concerning, please let us know."
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-2">Frequently Asked Questions</h1>
      <p className="text-secondary mb-10">
        Everything you need to know about Collective Sense
      </p>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group border border-border rounded-xl overflow-hidden"
          >
            <summary className="flex items-center justify-between p-5 cursor-pointer bg-white hover:bg-accent transition-colors">
              <h2 className="font-medium text-left pr-4">{faq.question}</h2>
              <span className="text-secondary group-open:rotate-180 transition-transform flex-shrink-0">
                ▼
              </span>
            </summary>
            <div className="p-5 pt-0 bg-white">
              <p className="text-secondary leading-relaxed">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-12 p-6 bg-accent rounded-2xl text-center">
        <h2 className="font-medium mb-2">Still have questions?</h2>
        <p className="text-secondary text-sm mb-4">
          We&apos;re happy to help with anything not covered here.
        </p>
        <Link
          href="/support"
          className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
        >
          Get in touch
        </Link>
      </div>
    </div>
  )
}
