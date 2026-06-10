import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use a model that's likely to be available
model = genai.GenerativeModel('gemini-pro')

DETAILED_PROMPT_TEMPLATE = """
Provide a comprehensive startup evaluation for the following idea in JSON format.
Idea: {idea}

Return EXACTLY this JSON structure with detailed, comprehensive content:
{{
  "executive_summary": "Write a 3-4 paragraph detailed executive summary covering market opportunity, value proposition, and why this startup matters",
  "market_opportunity": "Provide 2-3 detailed paragraphs covering: total addressable market (TAM), serviceable addressable market (SAM), target demographics, market growth rates, and why now is the right time",
  "competitor_analysis": "Write 2-3 detailed paragraphs analyzing 3-5 direct and indirect competitors, their strengths/weaknesses, and competitive advantages of this idea",
  "swot_analysis": "Provide 4 detailed paragraphs (one for each): Strengths (3-4 points with explanation), Weaknesses (3-4 points with explanation), Opportunities (3-4 points), Threats (3-4 points)",
  "revenue_model": "Write 2-3 detailed paragraphs explaining: multiple revenue streams, pricing strategy, customer acquisition cost assumptions, lifetime value calculations, break-even timeline",
  "launch_plan": "Provide a detailed 3-4 paragraph plan covering: MVP features, go-to-market strategy, funding requirements, 12-month roadmap with milestones",
  "investor_pitch": "Write a detailed 500+ word professional investor pitch email with compelling subject line, clear value prop, market opportunity, competitive advantages, team requirements, financial projections, and call to action",
  "financial_projections": {{
    "year1_revenue": "estimated first year revenue in USD",
    "year3_revenue": "estimated third year revenue in USD",
    "year5_revenue": "estimated fifth year revenue in USD",
    "burn_rate_monthly": "estimated monthly burn rate before profitability in USD",
    "break_even_months": "number of months to break even",
    "initial_funding_needed": "estimated seed/Series A funding needed in USD",
    "projected_margin": "expected profit margin percentage"
  }},
  "roadmap": {{
    "phase1": {{
      "months": "0-3",
      "title": "MVP Development",
      "milestones": ["milestone 1", "milestone 2", "milestone 3"]
    }},
    "phase2": {{
      "months": "3-6",
      "title": "Beta Launch & User Validation",
      "milestones": ["milestone 1", "milestone 2", "milestone 3"]
    }},
    "phase3": {{
      "months": "6-12",
      "title": "Product-Market Fit & Growth",
      "milestones": ["milestone 1", "milestone 2", "milestone 3"]
    }},
    "phase4": {{
      "months": "12-24",
      "title": "Series A & Scale",
      "milestones": ["milestone 1", "milestone 2", "milestone 3"]
    }}
  }},
  "revenue_breakdown": {{
    "stream1_name": "percentage",
    "stream2_name": "percentage",
    "stream3_name": "percentage"
  }},
  "market_size_breakdown": {{
    "category1": "market size in billions",
    "category2": "market size in billions",
    "category3": "market size in billions"
  }},
  "risks_and_mitigations": [
    {{
      "risk": "risk description",
      "likelihood": "high/medium/low",
      "impact": "high/medium/low",
      "mitigation": "detailed mitigation strategy"
    }}
  ],
  "team_requirements": {{
    "ceo_coo": "Required skills and experience",
    "cto": "Required skills and experience",
    "head_of_product": "Required skills and experience",
    "head_of_marketing": "Required skills and experience"
  }},
  "success_metrics": [
    "metric 1 with definition",
    "metric 2 with definition",
    "metric 3 with definition",
    "metric 4 with definition",
    "metric 5 with definition"
  ]
}}

Make all content detailed, specific, and data-driven. Use realistic market figures and projections.
"""

async def evaluate_idea(idea: str):
    if not os.getenv("GEMINI_API_KEY"):
        # Comprehensive mock response for development
        return {
            "executive_summary": "This AI-powered platform represents a significant opportunity in the rapidly growing market of business automation. With increasing demand for intelligent workflow solutions, the startup can capture substantial market share through a combination of superior technology, user experience, and strategic partnerships.\n\nThe addressable market spans multiple industries including professional services, tech startups, enterprise operations, and creative agencies. Current market leaders focus on horizontal solutions, creating an opportunity for a specialized, vertical-first approach.\n\nWith proper execution, market validation, and strategic funding, this venture could achieve unicorn status within 7-10 years. The founding team's ability to navigate product-market fit and scale efficiently will be critical success factors.",
            "market_opportunity": "The global market for workflow automation and productivity software is experiencing explosive growth, with a projected CAGR of 12.5% through 2030, reaching $47.8 billion by 2028. The serviceable addressable market for this specific solution is estimated at $8.2 billion, targeting mid-market companies (100-5,000 employees) and high-growth startups.\n\nKey demographics include Operations Directors (35-55 years, $150K+ salary), CTOs/VPs Engineering (30-50 years, $200K+ total comp), and Founders (25-45 years, high growth mindset). These segments show 34% year-over-year spending increase on productivity tools.\n\nMarket catalysts include post-pandemic remote work normalization, AI advancement enabling smarter automation, increasing labor costs forcing efficiency improvements, and regulatory compliance requirements driving systematic process documentation. The convergence of these factors creates a 3-5 year window of optimal market entry timing.",
            "competitor_analysis": "Direct competitors like Zapier, Make.com, and native workflow tools dominate horizontal automation, but they lack industry-specific intelligence and lack seamless team collaboration. Asana and Monday.com focus on project management rather than workflow intelligence. Indirect competitors include enterprise systems (Workato) which are expensive and require integration specialists.\n\nThis startup's competitive advantages: AI-native architecture (vs. legacy platforms), 60% lower TCO than enterprise alternatives, 10x faster implementation (days vs. months), and industry-specific templates. The competitor landscape presents a clear positioning opportunity for a specialized, intelligent, user-centric player.\n\nMarket consolidation is likely in 3-5 years, making early market capture critical. First-mover advantage in the AI-powered automation space could result in acquisition multiples of 8-12x revenue.",
            "swot_analysis": "STRENGTHS: Massive TAM with strong tailwinds; AI/ML capabilities creating defensible moat; Recurring revenue model with high margins; Strong unit economics enabling rapid growth; Ability to integrate with existing enterprise systems.\n\nWEAKNESSES: High customer acquisition cost ($3-5K per SMB customer); Requires strong technical founding team; Competitive response from well-funded incumbents; Complexity of enterprise sales cycles; Need for extensive customer support infrastructure.\n\nOPPORTUNITIES: International expansion (10x TAM in EU, APAC); Vertical-specific solutions for healthcare, fintech, real estate; AI-powered insights and predictive automation; Strategic partnerships with systems integrators; IPO or strategic acquisition window in years 5-7.\n\nTHREATS: Existing players integrating AI features (Microsoft, Salesforce); Economic downturn reducing SMB IT spending; Data privacy regulations (GDPR, CCPA); Emerging open-source alternatives; Talent acquisition in competitive AI/ML market.",
            "revenue_model": "Primary revenue stream: Tiered SaaS subscription ($299-$999/month) targeting 50% gross margins. Secondary streams include: professional services (implementation, $15-50K per deployment), enterprise support ($2-5K/month), API access ($0.05-0.10 per execution), and data analytics premium tier.\n\nCustomer Acquisition Strategy: Content marketing (blogs, webinars, case studies) targeting 15% CAC:LTV ratio; Sales team focusing on accounts $100K+ ARR; Strategic partnerships with systems integrators providing referrals; Product-led growth with freemium tier converting 8-12% to paid.\n\nPricing benchmarks against competitors indicate willingness to pay premium (20-30%) for specialized AI features. Conservative financial models project: Y1 $0.8M revenue (150 customers), Y2 $4.2M (420 customers), Y3 $14.5M (1,100 customers) at 35% average churn and $42K ACV.",
            "launch_plan": "MVP (Months 0-3): Core workflow automation engine, 5 industry templates, basic analytics, $500K seed funding. Beta launch with 20 reference customers generating case studies and testimonials.\n\nGo-to-Market (Months 3-6): Official product launch with marketing campaign, founding customer success stories, strategic partner announcements. Target initial cohort of 50 paying customers. Secure $2-3M seed extension.\n\nGrowth Phase (Months 6-12): Expand to 3-4 new verticals based on demand signals; hire VP Sales and marketing lead; establish enterprise sales motion; achieve $300K MRR. Position for Series A fundraising.\n\nYear 2 (Months 12-24): Geographic expansion to UK/EU/APAC; raise $8-12M Series A; achieve $2M+ MRR; build brand awareness in target segments.",
            "investor_pitch": """Subject: Introducing [Product Name] - The AI-Powered Workflow Intelligence Platform (Raising $3M Seed)

Dear [Investor Name],

I'm reaching out because we're building the future of business automation, and we believe your fund's focus on AI infrastructure companies makes you an ideal partner.

THE PROBLEM:
Companies waste $8.2 trillion annually on inefficient workflows and manual processes. Enterprise leaders spend 31% of their day managing emails, scheduling, and status updates instead of strategic work. Existing automation tools (Zapier, Make, native platforms) are technical, fragmented, and require engineering expertise—only 18% of businesses successfully implement them.

OUR SOLUTION:
[Product Name] combines AI intelligence with an intuitive interface to automate complex workflows in minutes, not months. Our proprietary AI understands business context, learns from user behavior, and continuously optimizes processes. Unlike horizontal tools, we provide vertical-specific intelligence (accounting workflows for finance, patient management for healthcare, job tracking for recruiting).

MARKET OPPORTUNITY:
- TAM: $47.8B (global workflow automation market growing 12.5% CAGR)
- SAM: $8.2B (mid-market and high-growth segment)
- SOM: $40M (year 3 realistic capture)

Customer segments include Finance/Accounting (23% TAM), Healthcare (18%), Recruiting (16%), and Operations (14%). Each is under-served by current solutions.

BUSINESS MODEL:
- Tiered SaaS: $299-$999/month (8-12 seats per customer)
- Target LTV: $180K; CAC: $3K (1.8:1 after year 1)
- Gross margins: 70%+ (AI leverage improves with scale)
- Break-even: Month 28 at conservative growth

TRACTION:
- 150 beta users across finance, healthcare, and tech sectors
- 94% satisfaction score in initial survey
- 2 LOIs from enterprise prospects ($180K+ annual)
- Founding team: 2 ex-Google engineers (TensorFlow contributors), 1 ex-Stripe PM

TEAM & CAPITAL ALLOCATION:
Raising $3M seed to: fund 5-person engineering team ($1.2M), build sales/marketing presence ($0.9M), expand customer success infrastructure ($0.6M), operating runway ($0.3M).

COMPETITIVE ADVANTAGES:
1. AI-native: Trained on 50K+ workflows from enterprise systems
2. Speed: 10x faster implementation than Workato/Zapier
3. Cost: 60% cheaper than legacy enterprise automation
4. Network effects: Workflow library benefits all customers
5. Defensible: Patent-pending intelligent process optimization

3-YEAR FINANCIAL PROJECTIONS:
- Year 1: $840K ARR, 150 customers, -$1.2M EBITDA (investment phase)
- Year 2: $4.2M ARR, 420 customers, -$400K EBITDA (approaching profitability)
- Year 3: $14.5M ARR, 1,100 customers, $2.1M EBITDA (22% margins)

EXIT OPPORTUNITY:
Market consolidation in automation space suggests acquisition targets are valued at 8-12x revenue (recent comps: Zapier $5B, Make.com $3B, Retool $1.2B). Conservative exit scenario = $200M+ valuation in year 5.

We believe this is a rare combination of: massive TAM, technical differentiation, experienced founding team, and optimal market timing. We're not asking for capital—we're offering partnership in building the future of work.

I'd love to discuss how we can build this together. Are you available for a call next Tuesday or Wednesday?

Best regards,
[Founder Name]
[Product Name]
[Phone]
[Email]""",
            "financial_projections": {
                "year1_revenue": "$840,000",
                "year3_revenue": "$14,500,000",
                "year5_revenue": "$58,200,000",
                "burn_rate_monthly": "$85,000",
                "break_even_months": "28",
                "initial_funding_needed": "$3,000,000",
                "projected_margin": "22%"
            },
            "roadmap": {
                "phase1": {
                    "months": "0-3",
                    "title": "MVP Development & Beta",
                    "milestones": [
                        "Core workflow engine built and tested",
                        "5 industry-specific templates completed",
                        "Basic analytics dashboard implemented",
                        "20 beta customers onboarded"
                    ]
                },
                "phase2": {
                    "months": "3-6",
                    "title": "Product-Market Fit & Early Revenue",
                    "milestones": [
                        "Official product launch and marketing campaign",
                        "50 paying customers acquired (>$300K MRR)",
                        "VP Sales hired and first enterprise deals closed",
                        "Series A preparation and due diligence"
                    ]
                },
                "phase3": {
                    "months": "6-12",
                    "title": "Growth & Scaling",
                    "milestones": [
                        "Expansion to 3-4 new vertical markets",
                        "Marketing and product teams scaled",
                        "$2M+ MRR achieved",
                        "Series A funding closed ($8-12M)"
                    ]
                },
                "phase4": {
                    "months": "12-24",
                    "title": "International Expansion",
                    "milestones": [
                        "UK, EU, and APAC offices established",
                        "Customer success team grows to 15+",
                        "$10M+ ARR achieved",
                        "Series B fundraising preparation"
                    ]
                }
            },
            "revenue_breakdown": {
                "SaaS Subscriptions": "72%",
                "Professional Services": "18%",
                "Enterprise Support": "7%",
                "API & Premium Features": "3%"
            },
            "market_size_breakdown": {
                "Finance & Accounting": "$11.0B",
                "Healthcare": "$8.6B",
                "HR & Recruiting": "$7.8B",
                "Operations & Manufacturing": "$19.4B"
            },
            "risks_and_mitigations": [
                {
                    "risk": "Competitive response from Salesforce, Microsoft, Zapier integrating AI features",
                    "likelihood": "high",
                    "impact": "high",
                    "mitigation": "Focus on vertical specialization and customer lock-in via network effects; expand TAM faster than competitors; strategic partnerships with complementary platforms"
                },
                {
                    "risk": "Customer churn due to integration complexity or poor UX",
                    "likelihood": "medium",
                    "impact": "high",
                    "mitigation": "Invest heavily in customer success (dedicated CSMs for $100K+ customers); continuous UX optimization; community-driven feature development"
                },
                {
                    "risk": "Inability to attract senior engineering talent in competitive AI/ML market",
                    "likelihood": "medium",
                    "impact": "high",
                    "mitigation": "Offer competitive equity packages; remote-first hiring; build engineering brand through tech talks and open-source contributions"
                },
                {
                    "risk": "Economic recession reducing enterprise IT spending",
                    "likelihood": "medium",
                    "impact": "medium",
                    "mitigation": "Focus on ROI-positive, cost-saving use cases; expand into SMB segment which prioritizes efficiency; develop low-cost freemium tier"
                },
                {
                    "risk": "Data privacy regulations (GDPR, CCPA) compliance costs",
                    "likelihood": "high",
                    "impact": "medium",
                    "mitigation": "Build compliance into product from day one; partner with specialized compliance firms; offer SOC 2 certification and advanced encryption"
                }
            ],
            "team_requirements": {
                "CEO/Founder": "Technical founder (CS/Math background) with deep SaaS experience; track record of scaling startups or leadership at hyper-growth company; strong communication and fundraising skills",
                "CTO/VP Engineering": "10+ years software engineering; experience with AI/ML systems and scalable architecture; previous startup or FAANG background; hands-on coding ability",
                "VP Product": "Product management experience in B2B SaaS; strong analytical and communication skills; ability to prioritize based on customer feedback and market signals; GTM experience",
                "VP Sales": "Enterprise sales experience; proven ability to close six-figure deals; experience selling to mid-market companies; network in target verticals",
                "Head of Customer Success": "CS/Account management background; proven ability to reduce churn and increase LTV; experience with both SMB and mid-market customers"
            },
            "success_metrics": [
                "Monthly Recurring Revenue (MRR): Measure of reliable, predictable income; target $50K MRR by month 12",
                "Customer Acquisition Cost (CAC): Total sales & marketing spent divided by new customers; target <$3K by year 2",
                "Customer Lifetime Value (LTV): Average revenue per customer over lifetime; target $180K+ by year 2",
                "Net Revenue Retention (NRR): Measure of expansion revenue from existing customers; target >120% by year 2",
                "Customer Churn Rate: Percentage of customers lost monthly; target <3% monthly by year 2",
                "Product-Market Fit Signals: Customer referral rate, retention cohorts, NPS score (target >50)",
                "Feature Adoption: % of customers using advanced features; drives expansion revenue and stickiness"
            ]
        }
    
    prompt = DETAILED_PROMPT_TEMPLATE.format(idea=idea)
    response = model.generate_content(prompt)
    
    try:
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        return json.loads(text)
    except Exception as e:
        print(f"Error parsing AI response: {e}")
        # Return comprehensive fallback
        return {
            "executive_summary": "Comprehensive analysis pending due to API constraints.",
            "market_opportunity": "Detailed market analysis pending...",
            "competitor_analysis": "Competitive landscape analysis pending...",
            "swot_analysis": "SWOT analysis pending...",
            "revenue_model": "Revenue modeling pending...",
            "launch_plan": "Detailed launch strategy pending...",
            "investor_pitch": "Professional investor pitch pending...",
            "financial_projections": {
                "year1_revenue": "TBD",
                "year3_revenue": "TBD",
                "year5_revenue": "TBD",
                "burn_rate_monthly": "TBD",
                "break_even_months": "TBD",
                "initial_funding_needed": "TBD",
                "projected_margin": "TBD"
            },
            "roadmap": {},
            "revenue_breakdown": {},
            "market_size_breakdown": {},
            "risks_and_mitigations": [],
            "team_requirements": {},
            "success_metrics": []
        }