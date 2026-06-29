# AI Startup Evaluator - Systematic Testing Plan

This guide provides exactly what to input in the UI to perform your tests, how to take screenshots of the results, and rules on how to grade the AI’s output for hallucinations, consistency, and other factors.

## Part 1: UI Input Testing & Screenshots

First, assure your application is running (both `backend` and `frontend`). Navigate to your Vite frontend URL in your browser (usually `http://localhost:5173`).

For each test below, copy and paste the provided input into the **Notes/Input field**, click **Evaluate**, and then capture a screenshot. 
*(To take a screenshot on Windows, press `Windows Key + Shift + S`, select the area of the screen with the results, and paste or save it).*

### 1. Normal Notes
*Tests standard functionality.*
**Input:**
> Had a meeting with Sarah from CloudNet today. They are building a B2B SaaS platform for automating cloud infrastructure scaling. Current MRR is $5k, aiming for $50k by end of year. Main competitor is ScaleAI but CloudNet claims their dynamic resource allocation is 30% more cost-effective. Need a technical co-founder to help build out the backend.

### 2. Messy Notes
*Tests how the AI extracts structured data from disorganized text.*
**Input:**
> uhh so Bob called about his startup... Foodix? i think. they do food delivery but for pets. it's AI powered algorithms for dog food. he wants $500k for 10%. right now they have 0 revenue. competitors are idk, Purina? Barkbox? he mentioned Barkbox. they need marketing help. wait no, they need supply chain help. email is bob@foodix.com.

### 3. Missing Owner
*Tests handling of missing required context.*
**Input:**
> A new anonymous marketplace for selling digital assets safely using zero-knowledge proofs. They are pre-revenue and have a working MVP, trying to raise $1M. No competitors currently exist with this level of privacy.

### 4. Empty Input
*Tests frontend validation and backend empty state handling.*
**Input:**
> *(Leave the input box completely blank)*
> *(Also try just typing a few spacebar characters: "   ")*

### 5. Very Long Input
*Tests truncation, UI overflow, and token limits.*
**Input:** 
> *(Paste a huge block of text. You can copy a few paragraphs directly from Wikipedia about "Artificial Intelligence", repeat it 5 times, and put "Also they are looking for a $1M investment for 10% equity" at the very end to see if the AI successfully extracts the last sentence.)*

---

## Part 2: Checking Output Quality Metrics

As you run the tests above (especially 1, 2, and 3), read the generated reports on the screen to check the following parameters:

### 1. Hallucination Check
**What to look for:** Did the AI make up facts, numbers, or features that were *not* in your input? 
*   **Example:** For the *Messy Notes* input, if the AI says Foodix has "$10,000 MRR" (when the text said 0 revenue), that is a hallucination.

### 2. JSON Consistency Check
**What to look for:** Look at your browser network tools or the resulting data boxes on the screen. 
*   Did the app crash or fail to parse the output? 
*   Did it return the correctly structured components (Summary, Market Analysis, SWOT, Revenue Model, Launch Plan, Pitch)? If it outputs raw code blocks like ```json in the UI instead of rendering neatly, it failed the JSON consistency check.

### 3. 'Not Specified' Handling
**What to look for:** How does it behave when information is missing?
*   In the *Missing Owner* test, does it smoothly state "Not specified" or "Unknown" for the Founder/Owner field? 
*   Does it gracefully acknowledge missing data in the SWOT analysis without breaking?

### 4. Priority Classification
**What to look for:** Is the assigned score or priority tier logical based on the text?
*   *Normal Notes* with existing MRR should likely get a Medium or High priority.
*   *Missing Owner* (anonymous) or *Messy Notes* with 0 revenue might be scored lower. 
*   Check if the tool's classification makes sense based on the provided business fundamentals.

### 5. Email Pitch Quality
**What to look for:** Read the generated follow-up pitch email.
*   Is the tone professional? 
*   Does it accurately reflect the specific next steps and gaps mentioned in the notes (e.g., mentioning Bob's need for supply chain help or Sarah's search for a technical co-founder)?
