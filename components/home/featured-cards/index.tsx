// FeatureCards component for the Home page

import React from "react";

// Data for the feature cards
const featureCards = [
  {
    title: "Easy Testing",
    description:
      "Describe your investment idea in plain language and let our platform do the heavy lifting.",
  },
  {
    title: "Comprehensive Analysis",
    description:
      "Get detailed performance metrics, risk analysis, and visualizations of your idea's performance.",
  },
  {
    title: "Explainable Results",
    description:
      "Understand why your idea performed the way it did with our detailed explanatory reports.",
  },
];

/**
 * Renders the feature cards for the Home page.
 */
export function FeatureCards() {
  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
      {featureCards.map((card) => (
        <div
          key={card.title}
          className="flex flex-col justify-center space-y-4"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              {card.title}
            </h2>
            <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
