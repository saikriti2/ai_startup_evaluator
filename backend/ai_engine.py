import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use a model that's likely to be available
model = genai.GenerativeModel('gemini-pro')

PROMPT_TEMPLATE = """
Evaluate the following startup idea and provide a detailed report in JSON format.
Idea: {idea}

The JSON should have exactly these keys:
- executive_summary
- market_opportunity
- competitor_analysis
- swot_analysis
- revenue_model
- launch_plan
- investor_pitch

Make the content professional, insightful, and data-driven.
"""

async def evaluate_idea(idea: str):
    if not os.getenv("GEMINI_API_KEY"):
        # Mock response for development if no key is provided
        return {
            "executive_summary": "This is a premium executive summary for " + idea,
            "market_opportunity": "Large market potential with growing CAGR.",
            "competitor_analysis": "Fragmented market with room for a tech-first approach.",
            "swot_analysis": "Strengths: Innovation. Weaknesses: Brand awareness. Opportunities: Expansion. Threats: Regulation.",
            "revenue_model": "SaaS subscription with tiered pricing.",
            "launch_plan": "Beta launch in Q3, followed by aggressive marketing.",
            "investor_pitch": "Subject: Revolutionizing the industry with " + idea
        }
    
    prompt = PROMPT_TEMPLATE.format(idea=idea)
    response = model.generate_content(prompt)
    
    try:
        # Try to parse JSON from the response
        text = response.text
        # Clean up possible markdown code blocks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        return json.loads(text)
    except Exception as e:
        print(f"Error parsing AI response: {e}")
        # Fallback if JSON parsing fails
        return {
            "executive_summary": response.text[:200] + "...",
            "market_opportunity": "Detailed analysis pending...",
            "competitor_analysis": "Detailed analysis pending...",
            "swot_analysis": "Detailed analysis pending...",
            "revenue_model": "Detailed analysis pending...",
            "launch_plan": "Detailed analysis pending...",
            "investor_pitch": "Detailed analysis pending..."
        }
