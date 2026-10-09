/**
 * What Did I Miss? - Pre-loaded Analytical Sample Chat Datasets
 * Tailored for WhatsApp (iOS & Android exports) with realistic media tags,
 * direct questions, task assignments, and decision checkpoints.
 */

const SAMPLE_CHATS = {
  whatsapp_retreat: {
    id: 'whatsapp_retreat',
    title: 'Executive Offsite & Activity Planning (WhatsApp iOS)',
    platform: 'WhatsApp iOS',
    description: 'WhatsApp iOS export with venue booking, go-karting proposals, budget decisions, photo attachments, and deadlines.',
    text: `[10/12/24, 09:15:00 AM] Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
[10/12/24, 09:15:10 AM] Maya created group "Executive Offsite Planning"
[10/12/24, 09:15:30 AM] Maya: Good morning team. We need to finalize the quarterly retreat itinerary and venue reservation before availability closes.
[10/12/24, 09:16:45 AM] Liam: I evaluated three venues. The Pine Valley Conference Center accommodates all 12 participants and includes dedicated presentation facilities for $1,800 total.
[10/12/24, 09:17:15 AM] Liam: <image omitted>
[10/12/24, 09:18:10 AM] Chloe: The Pine Valley facility is suitable. Liam, what is the approved per-person budget for activities?
[10/12/24, 09:19:22 AM] Liam: Finance approved a budget ceiling of $150 per person for offsite activities.
[10/12/24, 09:21:05 AM] Rohan: Regarding team activities: what about go karting on Saturday afternoon? The Grand Prix track has slots open at 4:00 PM.
[10/12/24, 09:21:30 AM] Rohan: <photo omitted>
[10/12/24, 09:22:15 AM] Maya: Go karting is a solid option. The rate is $65 per person, which fits well within our $150 budget.
[10/12/24, 09:23:40 AM] Liam: Agreed on go karting for the Saturday team activity. We need final headcounts submitted by Friday at 5:00 PM to confirm the track reservation.
[10/12/24, 09:25:00 AM] Chloe: Chloe will collect team dietary preferences and activity confirmations before Thursday at 3:00 PM.
[10/12/24, 09:26:30 AM] Rohan: Rohan will coordinate logistics and charter transport for the team departing Friday morning at 8:30 AM.
[10/12/24, 09:27:00 AM] Rohan: <attached: Pine_Valley_Route_Map.pdf>
[10/12/24, 09:28:12 AM] Sam: Decided on Pine Valley as the primary offsite venue. Liam, please process the deposit before tonight at 9:00 PM.
[10/12/24, 09:30:00 AM] Maya: Maya will distribute the keynote presentation agenda by Wednesday afternoon.
[10/12/24, 09:32:10 AM] Sam: Liam, can you confirm if the conference hall has high-speed Ethernet ports for all 12 attendees?
[10/12/24, 09:35:20 AM] Chloe: Meeting adjourned. Confirmation due Friday at 5:00 PM.`
  },

  whatsapp_android: {
    id: 'whatsapp_android',
    title: 'Client Demo & Architecture Synchronization (WhatsApp Android)',
    platform: 'WhatsApp Android',
    description: 'Native WhatsApp Android export (DD/MM/YY, HH:MM - Name: Message) with load test benchmarks, UI design reviews, and mockups.',
    text: `14/11/24, 11:20 - Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
14/11/24, 11:22 - Priya: Team, synchronization check for the enterprise client demonstration scheduled for Friday at 3:00 PM.
14/11/24, 11:24 - Rahul: Backend endpoints for single sign-on authentication and telemetry have been deployed to staging.
14/11/24, 11:25 - Priya: Rahul, can you verify API p99 latency benchmarks before 5:00 PM today?
14/11/24, 11:27 - Rahul: Acknowledged. I will execute load tests and submit performance benchmarks within 2 hours.
14/11/24, 11:28 - Rahul: <image omitted>
14/11/24, 11:29 - Ananya: What is our consensus on the dashboard aesthetic? Do we proceed with the clean light theme or the legacy dark theme?
14/11/24, 11:30 - Ananya: <attached: Dashboard_Light_Mode_Mockup.png>
14/11/24, 11:31 - Priya: Agreed on utilizing the clean light theme layout for the executive client presentation.
14/11/24, 11:32 - Rahul: Confirmed. Moving forward with the clean light theme design tokens.
14/11/24, 11:35 - Ananya: Ananya will finalize the component specifications in Figma and export assets before tomorrow at 6:00 PM.
14/11/24, 11:38 - Priya: Rahul, did you finish configuring the SSL certificates for the staging domain?
14/11/24, 11:40 - Priya: Critical milestone: internal demo dry run is scheduled for tomorrow at 10:00 AM sharp.`
  },

  startup: {
    id: 'startup',
    title: 'Production Incident: Payment Webhook Disruption',
    platform: 'WhatsApp Export',
    description: 'Critical payment gateway disruption, database migration rollback decision, 6:00 PM deployment deadline.',
    text: `[10/15/24, 10:15:00 AM] Messages and calls are end-to-end encrypted.
[10/15/24, 10:15:10 AM] Sarah: Team, we have a critical blocker in production right now. The Stripe webhook handler is returning 500 errors on renewal events.
[10/15/24, 10:16:00 AM] Alex: Checking Datadog metrics now. The database schema migration deployed last night failed to backfill the customer_id reference column.
[10/15/24, 10:17:15 AM] Alex: <image omitted>
[10/15/24, 10:18:00 AM] Marcus: Is this affecting new customer signups or only recurring monthly renewals?
[10/15/24, 10:19:00 AM] Sarah: It is blocking all recurring checkouts. Immediate priority: this is a Sev-1 incident.
[10/15/24, 10:21:00 AM] Alex: We have two recovery options: apply a targeted hotfix to the column nullability constraint, or execute a full rollback of PR #402. What is our direction?
[10/15/24, 10:23:00 AM] Sarah: Rollback introduces unacceptable risk due to dependent downstream analytics tables. Agreed on deploying a targeted hotfix for column nullability.
[10/15/24, 10:24:00 AM] Marcus: Agreed. Let us proceed with the targeted hotfix on PostgreSQL rather than executing a full rollback.
[10/15/24, 10:26:00 AM] Sarah: Alex, please draft the database migration patch and validate in staging. We need to deploy the hotfix before 6:00 PM today.
[10/15/24, 10:27:00 AM] Alex: Confirmed. Alex will have the pull request ready for peer review in 45 minutes.
[10/15/24, 10:29:00 AM] Marcus: Marcus will draft the external customer communication and update the status page before 2:00 PM.
[10/15/24, 10:31:00 AM] Sarah: Marcus, can you please verify the webhook retry queue after Alex executes the deployment?
[10/15/24, 10:32:00 AM] Marcus: Understood. I will verify the retry queue until zero failed events remain.
[10/15/24, 10:35:00 AM] David: Regarding infrastructure costs: we finalized the decision to migrate our caching infrastructure to AWS ElastiCache next sprint.
[10/15/24, 10:38:00 AM] Sarah: Noted. Let us schedule a post-incident review meeting for tomorrow at 11:00 AM.
[10/15/24, 10:45:00 AM] Sarah: Commencing code review. Alex, remain on standby until production verification completes.`
  }
};

// Export for ES modules and global browser scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SAMPLE_CHATS;
} else if (typeof window !== 'undefined') {
  window.SAMPLE_CHATS = SAMPLE_CHATS;
}
