"""
Diagnostic script to check where GEMINI_API_KEY comes from.
Run this to verify if your API key is in system env vars or .env file.
"""
import os
from pathlib import Path
from dotenv import load_dotenv, dotenv_values

print("=" * 70)
print("GEMINI API KEY SOURCE CHECKER")
print("=" * 70)

# 1. Check system environment (before load_dotenv)
print("\n[1] SYSTEM ENVIRONMENT VARIABLES (before load_dotenv):")
system_key = os.getenv("GEMINI_API_KEY")
if system_key:
    print(f"    ✅ FOUND in system env")
    print(f"    Value: {system_key[:10]}...{system_key[-10:]}")
else:
    print(f"    ❌ NOT found in system env")

# 2. Check .env file
print("\n[2] .ENV FILE:")
env_file_path = Path(__file__).parent / ".env"
if env_file_path.exists():
    print(f"    ✅ .env file EXISTS at: {env_file_path}")
    env_vars = dotenv_values(env_file_path)
    if "GEMINI_API_KEY" in env_vars:
        key = env_vars["GEMINI_API_KEY"]
        print(f"    ✅ GEMINI_API_KEY found in .env")
        print(f"    Value: {key[:10]}...{key[-10:]}")
    else:
        print(f"    ❌ GEMINI_API_KEY NOT in .env")
else:
    print(f"    ❌ .env file DOES NOT exist at: {env_file_path}")

# 3. Load from .env and check again
print("\n[3] AFTER load_dotenv():")
load_dotenv()
after_key = os.getenv("GEMINI_API_KEY")
if after_key:
    print(f"    ✅ GEMINI_API_KEY available after load_dotenv()")
    print(f"    Value: {after_key[:10]}...{after_key[-10:]}")
else:
    print(f"    ❌ GEMINI_API_KEY NOT available")

# 4. Final verdict
print("\n" + "=" * 70)
print("VERDICT:")
print("=" * 70)
if system_key and not system_key != after_key:
    print("✅ Key is in SYSTEM ENVIRONMENT VARIABLES (will work in deployment)")
    print("   → No .env file needed on the server")
elif after_key and not system_key:
    print("⚠️  Key is ONLY in .env file (will NOT work in deployment)")
    print("   → You MUST set GEMINI_API_KEY in your production environment")
elif after_key and system_key:
    print("✅ Key is in BOTH system env AND .env file")
    print("   → System env takes precedence")
else:
    print("❌ No GEMINI_API_KEY found anywhere!")
    print("   → You need to set it either:")
    print("      1. In system environment variables, OR")
    print("      2. In a .env file in the backend directory")

print("=" * 70)
