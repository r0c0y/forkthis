"use client";
import * as Tooltip from "@radix-ui/react-tooltip";

type Props = {
  children: React.ReactNode;
  content: string;
};

export default function IssueTooltip({ children, content }: Props) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="underline decoration-dotted cursor-help">
            {children}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="max-w-sm bg-gray-900 text-white text-sm rounded-md p-3 shadow-lg z-50"
            side="top"
            sideOffset={8}
          >
            {content}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
