/** Plain-English labels for demo review events. Raw state names stay in the fixture. */
const REVIEW_EVENT_LABELS: Record<string, string> = {
  "job.draft": "Draft created",
  "job.awaiting_send_approval": "Waiting for approval to send",
  "job.awaiting_answer": "Waiting for an answer",
  "delivery.simulated": "Delivery simulated on this computer",
  "job.awaiting_review": "Waiting for human review",
  "job.approved": "Human reviewer recorded an approval",
  "job.applied": "Recorded decision applied to the demo",
};

export function reviewEventLabel(name: string): string {
  return REVIEW_EVENT_LABELS[name] ?? "Review update";
}
