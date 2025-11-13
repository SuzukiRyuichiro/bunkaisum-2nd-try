# CLAUDE.md Update Proposal Command

**Your Role**: Analyze conversation history and propose new rules or patterns that should be added to CLAUDE.md.

**Important**: Output "proposals for what to add to CLAUDE.md", not summaries or explanations of the conversation.

## Usage

```bash
/suggest-claude-md
```

## Analysis Criteria

Detect content that matches one of these 3 trigger conditions:

### 1. Project-Specific Rules

**Detection Patterns**:

- "Use X instead of Y"
- "In this project, we do XXX like this"
- Standard code generation followed by requests to modify to project-specific patterns

**Examples for Nuxt Applications**:

- Don't directly reference environment variables; use the project's custom useConfig() composable
- In this project, we don't directly use route params in components; extract them via composables
- Use the project's existing data fetching utilities instead of raw $fetch in components
- Always use the project's custom composables for API calls rather than direct fetch requests

### 2. Repeated Similar Modification Instructions

**Detection Patterns**:

- The same type of modification instruction appears 2+ times
- Similar code modifications occur across multiple files/components
- The same advice is given multiple times

**Examples for Nuxt**:

- Multiple components need the same composable extraction pattern
- Multiple routes require the same middleware setup
- Multiple API routes need the same error handling pattern
- Multiple components use the same state management approach

### 3. Patterns That Should Be Unified Across Related Areas

**Detection Patterns**:

- "Keep these two areas consistent"
- "Unify client and server implementations"
- "Keep pages and API routes aligned"
- Instructions to maintain consistency across related multiple locations

**Examples for Nuxt**:

- "If the client route is `/products/:id/details`, the API route should be `/api/products/:id/details`"
- "When updating the data structure in the API route, update the corresponding composable type definitions"
- "This form validation pattern should be used consistently across all pages"

## Output Format

**Required**: Output in this format only. Other formats (summaries, reports, explanations) are prohibited.

If a trigger is matched:

```markdown
Analyzed conversation history. Would you like to add the following to CLAUDE.md?

[Specific proposed content]

Reason: [Project-specific rule / Repeated similar modification instructions (N times) / Pattern that should be unified across related areas]
```

If no trigger is matched:

```markdown
Analyzed conversation history. No new content found that should be added to CLAUDE.md.
```

**Prohibited Formats**:

- Don't write in completion format like "X was fixed" or "Y was implemented"
- Don't output conversation summaries or explanations
- Don't omit the opening line "Analyzed conversation history."

## Proposal Criteria

### Propose (✓)

- Universal rules that the entire Nuxt project should follow
- Content where technical accuracy can be guaranteed
- Content that can be clearly formalized as a rule
- New patterns created by this code change

### Don't Propose (✗)

- Temporary judgments or one-off solutions
- Content already in CLAUDE.md
- Personal preferences or experimental attempts
- Unclear or vague instructions

## Post-Execution Actions

1. Review the proposed content
2. If appropriate, instruct Claude to add it to CLAUDE.md
3. Include in the same PR as code changes
4. Have team members review the CLAUDE.md updates in PR review
