export type Plan = {
  id: "free-newsletter" | "supporter-monthly" | "supporter-yearly";
  name: string;
  audience: string;
  description: string;
  included: string[];
  price: string;
  interval: string;
  originalPrice?: string;
  cancelNote: string;
  paid: boolean;
};

export const ENABLE_PAID_PLANS = process.env.ENABLE_PAID_PLANS === "true";

export function getPlans(): Plan[] {
  const plans: Plan[] = [
    {
      id: "free-newsletter",
      name: "Free Newsletter",
      audience: "For readers who want a concise daily briefing.",
      description: "A dependable digest of the stories worth your attention.",
      included: ["Daily newsletter", "Hindi and Hinglish reading options"],
      price: "Free",
      interval: "forever",
      cancelNote: "No payment or commitment.",
      paid: false
    }
  ];

  if (ENABLE_PAID_PLANS) {
    plans.push(
      {
        id: "supporter-monthly",
        name: "Supporter Monthly",
        audience: "For readers who want to support independent newsroom work.",
        description: "A monthly contribution toward keeping GenzyWayNews useful and accessible.",
        included: ["Daily newsletter", "Hindi and Hinglish reading options"],
        price: process.env.SUPPORTER_MONTHLY_PRICE || "Set price",
        interval: "month",
        cancelNote: process.env.SUPPORTER_CANCEL_NOTE || "Cancel anytime.",
        paid: true
      },
      {
        id: "supporter-yearly",
        name: "Supporter Yearly",
        audience: "For readers who prefer one annual contribution.",
        description: "A yearly contribution toward the newsroom.",
        included: ["Daily newsletter", "Hindi and Hinglish reading options"],
        price: process.env.SUPPORTER_YEARLY_PRICE || "Set price",
        interval: "year",
        cancelNote: process.env.SUPPORTER_CANCEL_NOTE || "Cancel anytime.",
        paid: true
      }
    );
  }

  return plans;
}
