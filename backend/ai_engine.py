import os
import asyncio
import google.generativeai as genai
from dotenv import load_dotenv
import json
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info(f"✅ Gemini configured with key: {GEMINI_API_KEY[:8]}...{GEMINI_API_KEY[-4:]}")
else:
    logger.warning("⚠️  GEMINI_API_KEY not found in environment. Running in mock mode.")

PROMPT_TEMPLATE = """
You are an expert startup analyst and venture capital advisor. Evaluate the following startup idea and provide a comprehensive, data-driven, highly specific report.

Startup Idea: {idea}

Return ONLY a valid JSON object with EXACTLY these 7 keys. No markdown, no code fences, no extra text — just raw JSON.

{{
  "executive_summary": "A compelling 3-4 sentence summary of the startup, its mission, unique value proposition, target market, and why now is the right time. Be specific to THIS idea.",
  "market_opportunity": "Detailed market analysis specific to this idea: estimate the TAM (Total Addressable Market), SAM, and SOM with realistic dollar figures and CAGR. Identify the top 2-3 customer segments and what pain points they face. Include market trends supporting this opportunity.",
  "competitor_analysis": "Name 3-5 real or likely direct competitors. For each, describe their weakness this startup can exploit. Then describe this startup's key differentiators and defensible moats (e.g. network effects, IP, proprietary data).",
  "swot_analysis": "STRENGTHS: [list exactly 3 specific strengths of this startup]. WEAKNESSES: [list exactly 3 specific challenges or gaps]. OPPORTUNITIES: [list exactly 3 market or timing opportunities]. THREATS: [list exactly 3 real threats including regulatory, competitive, or market risks].",
  "revenue_model": "Primary revenue stream (e.g. SaaS, marketplace, licensing) with specific pricing tiers. Include unit economics: estimated CAC, LTV, and LTV:CAC ratio. 5-Year Revenue Milestones — Year1: $[X]K, Year2: $[X]K, Year3: $[X]M, Year4: $[X]M, Year5: $[X]M. Include secondary revenue streams.",
  "launch_plan": "Phase 1 (Month 1-2): [specific founding and validation actions]. Phase 2 (Month 3-5): [MVP and beta launch actions with target user count]. Phase 3 (Month 6-12): [growth and go-to-market with specific KPIs]. Phase 4 (Year 2+): [scaling and fundraising milestones]. Each phase must be specific and actionable.",
  "investor_pitch": "Subject: [Compelling subject line]\\n\\nDear [Investor Name],\\n\\n[Opening hook with market problem]. [Solution and why this team/idea is uniquely positioned]. [Market size cite from analysis]. [Current traction or ask for seed/pre-seed funding of $X for Y months of runway]. [Specific use of funds]. \\n\\nWarm regards,\\n[Founder Name]\\n[Startup Name] | [Title]\\n[Contact]"
}}
"""


def _generate_sync(idea: str) -> str:
    """Synchronous Gemini API call — must be run in a thread via asyncio.to_thread."""
    m = genai.GenerativeModel("gemini-2.5-flash")
    response = m.generate_content(
        PROMPT_TEMPLATE.format(idea=idea),
        generation_config=genai.types.GenerationConfig(
            temperature=0.75,
            max_output_tokens=4096,
            response_mime_type="application/json",
        ),
    )
    return response.text


import re

def _parse_json(text: str) -> dict:
    """Extract valid JSON from Gemini response using multiple strategies."""
    original = text

    # Strip markdown code fences more aggressively
    text = re.sub(r"^```[a-zA-Z]*\n", "", text, flags=re.MULTILINE)
    text = re.sub(r"```$", "", text, flags=re.MULTILINE)
    text = text.strip()

    # Strategy 1: direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        err_msg1 = str(e)

    # Strategy 2: find first { ... last }
    start = text.find("{")
    end = text.rfind("}") + 1
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end])
        except json.JSONDecodeError as e:
            err_msg2 = str(e)

    logger.error(f"❌ JSON Parse Error 1: {err_msg1}")
    if 'err_msg2' in locals():
        logger.error(f"❌ JSON Parse Error 2: {err_msg2}")
    
    logger.error(f"First 500 chars of AI text:\n{original[:500]}")
    logger.error(f"Last 500 chars of AI text:\n{original[-500:]}")
    raise ValueError("Gemini returned unparseable JSON")


async def evaluate_idea(idea: str) -> dict:
    """Main evaluation function — calls Gemini API asynchronously."""
    if not GEMINI_API_KEY:
        logger.warning("No API key — returning MOCK response.")
        return _mock_response(idea, "No GEMINI_API_KEY in .env")

    try:
        logger.info(f"🤖 Calling Gemini for: '{idea[:80]}'")
        text = await asyncio.to_thread(_generate_sync, idea)
        logger.info("✅ Gemini responded successfully.")
        result = _parse_json(text)

        # Validate all required keys are present
        required = ["executive_summary", "market_opportunity", "competitor_analysis",
                    "swot_analysis", "revenue_model", "launch_plan", "investor_pitch"]
        missing = [k for k in required if k not in result]
        if missing:
            logger.warning(f"⚠️  Gemini response missing keys: {missing}. Attempting partial use.")
            for k in missing:
                result[k] = f"[AI did not return this section for missing key: {k}]"

        return result

    except Exception as e:
        logger.error(f"❌ Gemini API error: {type(e).__name__}: {e}")
        return _mock_response(idea, f"{type(e).__name__}: {str(e)[:120]}")


async def test_api_connection() -> dict:
    """Quick ping to verify the Gemini API key is valid and working."""
    if not GEMINI_API_KEY:
        return {
            "status": "error",
            "connected": False,
            "message": "GEMINI_API_KEY is not set in backend/.env",
            "hint": "Get a free key at https://aistudio.google.com/app/apikey"
        }

    # Sanity check: Gemini keys used to start with 'AIza', but newer keys can start with 'AQ.'
    if not (GEMINI_API_KEY.startswith("AIza") or GEMINI_API_KEY.startswith("AQ.")):
        return {
            "status": "error",
            "connected": False,
            "message": f"API key looks invalid (starts with '{GEMINI_API_KEY[:6]}...').",
            "hint": "Get a valid key at https://aistudio.google.com/app/apikey"
        }

    try:
        m = genai.GenerativeModel("gemini-2.5-flash")
        response = await asyncio.to_thread(
            lambda: m.generate_content("Reply with exactly: OK")
        )
        return {
            "status": "ok",
            "connected": True,
            "model": "gemini-2.5-flash",
            "message": f"Gemini API connected. Test response: '{response.text.strip()[:40]}'"
        }
    except Exception as e:
        return {
            "status": "error",
            "connected": False,
            "message": str(e),
            "hint": "Check if your API key is valid and has quota."
        }


def _mock_response(idea: str, reason: str = "") -> dict:
    tag = f"[MOCK — {reason}]" if reason else "[MOCK]"
    return {
        "executive_summary": f"{tag} AI evaluation unavailable. This is a placeholder.",
        "market_opportunity": f"{tag} Configure a valid GEMINI_API_KEY in backend/.env to get real AI analysis.",
        "competitor_analysis": f"{tag} Real competitor analysis requires a working Gemini API key.",
        "swot_analysis": f"STRENGTHS: {tag} Not available. WEAKNESSES: {tag} Not available. OPPORTUNITIES: {tag} Not available. THREATS: {tag} Not available.",
        "revenue_model": f"{tag} Revenue projections require AI analysis.",
        "launch_plan": f"Phase 1: {tag} Launch plan requires AI analysis. Get your free API key at https://aistudio.google.com/app/apikey",
        "investor_pitch": f"Subject: {tag} API Key Required\n\nDear Investor,\n\nThis is a mock response. To generate a real investor pitch, please configure a valid GEMINI_API_KEY in the backend/.env file.\n\nGet your free key at: https://aistudio.google.com/app/apikey\n\nReason: {reason}"
    }
