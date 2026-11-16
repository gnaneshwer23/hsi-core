# Usability Test Plan: landing page and onboarding

Status: first draft. No sessions have been run, so there are no findings here. Written with the `uxr-usability-test-plan` method (moderated, think-aloud, tasks not tours).

**Design under test:** public landing page (`/`) and the four-step onboarding (`/welcome`) on the current main branch | **Groups:** one: working immunology or autoimmune researchers who search the literature for their own work | **Sessions:** 5, remote, dates to be set by the research lead | **Length:** 40 min plus 15 min gap for notes

## Test goals
| Goal | Research question | Part of the design |
|---|---|---|
| See whether a researcher can say what HSI is for, unprompted | RQ1: Is the value of the graph clear without a guide? | Landing hero, first screen |
| See whether the live graph is used or only looked at | RQ2: Do researchers find, filter and open a concept they care about? | Hero graph console |
| See whether the claim record and labels are understood | RQ3: Do "candidate", "unreviewed" and "Not recorded" read as honesty, or as a broken product? | Claim record, status strip |
| See whether onboarding is completed and feels worth it | RQ4: Where do people stall or give up in the required four steps? | `/welcome` steps 1 to 4 |
| See whether the first dashboard is recognisably theirs | RQ5: Does the personalised home match what they said they work on? | `/research/home` after setup |

## Tasks and success criteria
Criteria are fixed before testing. Participants use an invented profile, never a real ORCID, real papers or patient data.

| # | Scenario as read aloud | Start point | Completed | Completed with help | Not completed |
|---|---|---|---|---|---|
| 1 | "A colleague sent you this link. Have a look and tell me, in your own words, what it is and whether it would matter to your work." (no clicking required) | Landing, nothing scrolled | States purpose in terms close to "evidence graph with gaps" and names one use for their own work | Needs a prompt or scroll to answer | Cannot say what it is, or describes it as a paper search engine |
| 2 | "You work on IL-21. Find what the site knows about it." | Landing | Reaches a panel or explorer page for IL-21 without being told how | Uses a hint ("is there a search?") | Gives up or reaches a wrong concept and does not notice |
| 3 | "You only trust findings from human studies. Show only those." | Landing graph | Human-evidence filter on and the graph visibly narrowed | Finds it after a prompt | Does not find it |
| 4 | "Pick any relationship and tell me where it came from and how sure the site is." | Selected concept | Names the source and states that it is unreviewed | Reads the fields but misreads the status | Cannot find the source or believes it is approved |
| 5 | "You are interested in this and want it tailored to your research. Set that up." | Landing | Completes all four steps and lands on the home page | Completes after a question about a step | Stops before the end |
| 6 | "Looking at your home page, does it show what you said you work on? What is missing?" | Home after setup | Names at least one thing that matches and one gap, unprompted | Needs prompting | Cannot relate it to their input |

## Moderator script
1. **Intro:** "We are testing the design, not you. Nothing you do is wrong." Consent check: session recording, AI transcription (named separately), that they use an invented profile, that they can stop at any time. Use the consent form from `uxr-consent-form`.
2. **Think-aloud ask:** "Please say out loud what you are looking at, what you expect and what you are thinking." Neutral prompts only: "What are you thinking?" "What did you expect?"
3. **Tasks 1 to 6**, each followed by one open question: "What was that like?" Close with: "What would you change first?" and thanks. Never ask "do you like it" or "would you use it". When they struggle, wait.

No time on task is reported from these sessions.

## Observer note grid
| Task | Outcome | Path | Hesitations | Quote and timestamp |
|---|---|---|---|---|
| 1 to 6 | completed / with help / not completed | clicks in order | where and how long, described not timed | "[verbatim]" [mm:ss] |

## Sample and pilot
Five participants in one group is a rule of thumb for finding problems, not a measurement. It cannot say how many researchers would adopt the product, and it says nothing about other groups (clinicians, students, industry). Recruit with `uxr-recruitment-brief` and `uxr-participant-screener` (behaviour and recency: searched the literature on an autoimmune topic in the last month). Include at least one participant who uses a screen reader or keyboard only, planned with `uxr-accessible-sessions`. Pilot once with a colleague outside the project and fix the tasks before the first real session.

## Open items for the research lead
- Who recruits and from where (named owner), incentive and finance rules.
- Where recordings are stored and when they are deleted (`uxr-data-handling-plan`): participant data must not enter this repository.
- Whether a signed-off privacy notice is needed before external sessions.

## Decision
[Research lead] signs off the tasks and criteria after the pilot by [date]. Next: run `uxr-usability-findings` on the real sessions.
