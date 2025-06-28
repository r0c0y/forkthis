import React from 'react';

/**
 * A reusable component to ensure consistent section styling and structure.
 * @param id - The ID for the section, used for anchor links.
 * @param children - The content of the section.
 */
export const GuideSection = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <section id={id}>
    {children}
  </section>
);

/**
 * A reusable component for consistent heading styles within GuideSections.
 * @param children - The content of the title.
 */
export const GuideTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-semibold mt-6 mb-2">
    {children}
  </h2>
);