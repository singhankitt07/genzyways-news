import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "you@example.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeThisPassword123!";
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.deleteMany({ where: { role: "ADMIN", NOT: { email } } });
  await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: "ADMIN" },
    create: { email, password: hash, name: "Editor", role: "ADMIN" }
  });
  console.log(`Admin user ready: ${email}`);

  const sample = [
    {
      title: "Parliament Session Begins With Focus on Economic Reform Bills",
      slug: "parliament-session-economic-reform",
      summary: "Lawmakers convened for a session expected to center on a set of pending economic reform bills.",
      content: "Lawmakers convened today for a session expected to center on a set of pending economic reform bills.\n\nOpposition parties signaled they would seek amendments before the bills move to a vote, while the ruling coalition pushed for a faster timeline.\n\nAnalysts say the outcome could shape policy direction heading into the next fiscal year.",
      category: "Current Affairs",
      author: "Staff Reporter",
      breaking: true,
      published: true
    },
    {
      title: "New Smartphone Chipset Promises Major On-Device AI Boost",
      slug: "new-chipset-on-device-ai-boost",
      summary: "The latest flagship chipset shifts more AI processing on-device, cutting reliance on the cloud.",
      content: "The latest flagship chipset shifts significantly more AI processing on-device, reducing reliance on cloud servers for everyday tasks like translation and photo editing.\n\nEarly benchmarks show notable gains in speed and battery efficiency compared to the previous generation.\n\nManufacturers are expected to announce devices using the new chipset within the next few months.",
      category: "Tech News",
      author: "Staff Reporter",
      breaking: false,
      published: true
    },
    {
      title: "Major AI Lab Unveils Next-Generation Model With Stronger Reasoning",
      slug: "ai-lab-next-gen-model-reasoning",
      summary: "The new model shows marked improvement on multi-step reasoning and coding benchmarks.",
      content: "A major AI lab this week unveiled its next-generation model, reporting marked improvement on multi-step reasoning and coding benchmarks compared to its predecessor.\n\nEarly access users highlighted stronger performance on complex, multi-part tasks and fewer factual errors in longer responses.\n\nThe company said broader rollout would follow in the coming weeks, alongside updated developer pricing.",
      category: "AI World",
      author: "Staff Reporter",
      breaking: true,
      published: true
    },
    {
      title: "Markets Rally as Rate Cut Hopes Build",
      slug: "markets-rally-rate-cut-hopes",
      summary: "Benchmark indices climbed for a third session as investors priced in a softer policy stance.",
      content: "Benchmark indices climbed for a third straight session on Wednesday as investors priced in a softer policy stance from the central bank.\n\nTrading volumes picked up in the final hour, with banking and IT stocks leading gains. Analysts said the move reflected a broader repricing of rate expectations rather than a single catalyst.\n\nMarket watchers will be looking to the next policy meeting for confirmation of the trend.",
      category: "Business",
      author: "Staff Reporter",
      breaking: false,
      published: true
    },
    {
      title: "Government Announces New Digital Infrastructure Push",
      slug: "govt-digital-infrastructure-push",
      summary: "A fresh policy package aims to expand broadband access in underserved districts.",
      content: "The government today announced a fresh policy package aimed at expanding broadband access in underserved districts over the next three years.\n\nOfficials said the plan includes subsidies for last-mile connectivity and incentives for private telecom operators to build in low-density areas.\n\nIndustry groups broadly welcomed the move, though some flagged concerns about implementation timelines given past delays on similar projects.",
      category: "Current Affairs",
      author: "Staff Reporter",
      breaking: false,
      published: true
    },
    {
      title: "Foldable Phones Finally Go Mainstream as Prices Drop",
      slug: "foldable-phones-mainstream-prices-drop",
      summary: "A new wave of mid-range foldables is pulling the category out of niche territory.",
      content: "A new wave of mid-range foldable phones is pulling the category out of niche territory, with several manufacturers now offering models under a price point that puts them within reach of mainstream buyers.\n\nDurability, long a sticking point for foldables, has also improved significantly in the latest generation of hinge designs.\n\nAnalysts expect foldables to account for a meaningfully larger share of premium phone sales this year.",
      category: "Tech News",
      author: "Staff Reporter",
      breaking: false,
      published: true
    },
    {
      title: "Open-Source AI Models Close the Gap With Closed Rivals",
      slug: "open-source-ai-models-close-gap",
      summary: "New benchmark results show leading open-weight models within striking distance of proprietary ones.",
      content: "New benchmark results released this week show leading open-weight AI models are now within striking distance of top proprietary systems on several standard tests.\n\nResearchers say the gap has narrowed faster than expected, driven by better training techniques rather than simply larger models.\n\nThe trend is likely to accelerate adoption of open models among startups and enterprises wary of vendor lock-in.",
      category: "AI World",
      author: "Staff Reporter",
      breaking: false,
      published: true
    },
    {
      title: "Startup Funding Rebounds After a Slow Year",
      slug: "startup-funding-rebounds",
      summary: "Early-stage investment activity picked up sharply in the latest quarter.",
      content: "Early-stage investment activity picked up sharply in the latest quarter, according to new data, reversing a multi-quarter slowdown.\n\nFintech and AI-adjacent startups accounted for a disproportionate share of the new funding, investors said, as capital continues to concentrate around a smaller number of higher-conviction bets.\n\nFounders described a market that remains selective but noticeably more active than a year ago.",
      category: "Business",
      author: "Staff Reporter",
      breaking: false,
      published: true
    },
    {
      title: "Opinion: The Gen Z Workplace Isn't What You Think It Is",
      slug: "opinion-genz-workplace",
      summary: "The generational stereotypes miss what's actually changing about how young people work.",
      content: "Most commentary about Gen Z in the workplace reaches for the same handful of stereotypes: distracted, entitled, allergic to hierarchy.\n\nWhat's actually changing is narrower and more interesting: a lower tolerance for ambiguity about expectations, and a much faster willingness to leave a role that doesn't deliver on what was promised.\n\nCompanies that treat this as a management problem, not a generational personality flaw, are already seeing better retention.",
      category: "Opinion",
      author: "Guest Columnist",
      breaking: false,
      published: true
    },
    {
      title: "Opinion: Why the Next Decade Belongs to Regional Manufacturing",
      slug: "opinion-regional-manufacturing",
      summary: "Shifting supply chains are quietly rewriting who makes what, and where.",
      content: "Supply chains have spent two decades optimizing for cost above all else. That era is ending.\n\nThe next decade will reward proximity, redundancy, and speed, and that favors regional manufacturing hubs over single-source dependence.\n\nThis is not a retreat from global trade. It is a rebalancing, and the countries that recognize it early will capture a disproportionate share of the investment that follows.",
      category: "Opinion",
      author: "Guest Columnist",
      breaking: false,
      published: true
    }
  ];

  for (const article of sample) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article
    });
  }
  console.log("Sample articles seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
