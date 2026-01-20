import os
import sys
import argparse
from notion_client import Client
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env.local")

# Initialize Notion
notion = Client(auth=os.environ["NOTION_KEY"])
db_id = os.environ["NOTION_DATABASE_ID"]

# Token cost estimates for guidance (used in Micro Log auto-estimation)
TOKEN_ESTIMATES = {
    "Micro Log": 100,
    "Daily Log": 1500,
    "Deep Audit": {
        "Security": 8000,
        "Performance": 10000,
        "Architecture": 12000,
        "Full": 15000
    }
}

def chunk_text(text, max_length=1800):
    """Split text into chunks that fit Notion's 2000-char paragraph limit with safety margin."""
    chunks = []
    while len(text) > max_length:
        # Try to split at a reasonable point (newline, period, space)
        split_at = text.rfind('\n', 0, max_length)
        if split_at == -1:
            split_at = text.rfind('. ', 0, max_length)
        if split_at == -1:
            split_at = text.rfind(' ', 0, max_length)
        if split_at == -1:
            split_at = max_length
        
        chunks.append(text[:split_at].strip())
        text = text[split_at:].strip()
    
    if text:
        chunks.append(text)
    
    return chunks

def create_log(mode, summary, files, next_steps, impact=None, flags=None, tokens=0, audit_body=None, audit_type=None):
    """
    Create a log entry in Notion with smart chunking for long bodies.
    
    Args:
        mode: "Daily Log", "Deep Audit", or "Micro Log"
        summary: Brief description of changes
        files: Comma-separated list of modified files
        next_steps: Next action items (Daily Log only)
        impact: Comma-separated impact areas (Deep Audit only)
        flags: Comma-separated dev mode flags (Deep Audit only)
        tokens: Token cost (integer)
        audit_body: Detailed audit report (Deep Audit only)
        audit_type: Type of audit - Security, Performance, Architecture, Full (optional)
    """
    # Add audit type prefix to summary if provided
    display_summary = f"[{audit_type}] {summary}" if audit_type else summary
    
    # Base properties
    properties = {
        "Name": {"title": [{"text": {"content": f"{mode}: {datetime.now().strftime('%Y-%m-%d %H:%M')}"}}]},
        "Type": {"select": {"name": mode}},
        "Summary": {"rich_text": [{"text": {"content": display_summary[:2000]}}]},  # Truncate if needed
        "Files Changed": {"rich_text": [{"text": {"content": files[:2000]}}]},
        "Status": {"select": {"name": "Active"}},
        "Token Cost": {"number": int(str(tokens).replace(',', '').replace('k', '000').replace('~', ''))},
    }

    if mode == "Daily Log" or mode == "Micro Log":
        if next_steps and next_steps != "None":
            properties["Next Steps"] = {"rich_text": [{"text": {"content": next_steps[:2000]}}]}

    if mode == "Deep Audit":
        # IMPACT AREAS
        if impact and impact != "None":
            impact_list = [{"name": i.strip()} for i in impact.split(',')]
            properties["Impact Areas"] = {"multi_select": impact_list}
            
        # DEV FLAGS
        if flags and flags != "None":
            flag_list = [{"name": f.strip()} for f in flags.split(',')]
            properties["Dev Mode Flags"] = {"multi_select": flag_list}

    # Create the page (this succeeds even if body append fails)
    try:
        new_page = notion.pages.create(parent={"database_id": db_id}, properties=properties)
    except Exception as e:
        print(f"ERROR: Failed to create Notion page: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Append Audit Body if present (with chunking to avoid 2000-char limit)
    if mode == "Deep Audit" and audit_body:
        try:
            # Split body into manageable chunks
            chunks = chunk_text(audit_body, max_length=1800)
            
            # Build blocks: heading + chunked paragraphs
            blocks = [
                {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"text": {"content": "System Audit Report"}}]}}
            ]
            
            for chunk in chunks:
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {"rich_text": [{"text": {"content": chunk}}]}
                })
            
            notion.blocks.children.append(block_id=new_page["id"], children=blocks)
        except Exception as e:
            print(f"WARNING: Page created but body append failed: {e}", file=sys.stderr)
            print(f"Log created (partial): {new_page['url']}")
            sys.exit(0)  # Don't fail completely - page was created
    
    print(f"Log created successfully: {new_page['url']}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Log development sessions to Notion with token tracking",
        epilog="Example: .venv/bin/python logger.py --mode 'Daily Log' --summary 'Fixed bug' --files 'app.py' --next 'Test fix' --tokens 1200"
    )
    
    parser.add_argument("--mode", choices=["Daily Log", "Deep Audit", "Micro Log"], required=True,
                        help="Type of log entry")
    parser.add_argument("--summary", required=True,
                        help="Brief description of changes (will be prefixed with audit type if provided)")
    parser.add_argument("--files", default="None",
                        help="Comma-separated list of modified files")
    parser.add_argument("--next", default="None",
                        help="Next action items (for Daily/Micro Logs)")
    parser.add_argument("--impact", default="None",
                        help="Comma-separated impact areas: Game Economy, UI/UX, Backend, Tech Debt, Marketing, Analytics")
    parser.add_argument("--flags", default="None",
                        help="Comma-separated dev mode flags (e.g., 'Stripe Test Keys', 'Debug Mode')")
    parser.add_argument("--tokens", type=int, default=0,
                        help="Token cost for this operation (integer only)")
    parser.add_argument("--audit-type", choices=["Security", "Performance", "Architecture", "Full"], default=None,
                        help="Type of audit (Deep Audit only) - will prefix summary")
    
    # Body input options (mutually exclusive)
    body_group = parser.add_mutually_exclusive_group()
    body_group.add_argument("--body", default="",
                            help="Audit report body (short text)")
    body_group.add_argument("--body-file", type=str,
                            help="Path to file containing audit body (for long reports)")
    body_group.add_argument("--body-stdin", action="store_true",
                            help="Read audit body from stdin (avoids shell escaping)")
    
    args = parser.parse_args()
    
    # Determine body content from various input sources
    audit_body = ""
    if args.body:
        audit_body = args.body
    elif args.body_file:
        try:
            with open(args.body_file, 'r') as f:
                audit_body = f.read()
        except FileNotFoundError:
            print(f"ERROR: Body file not found: {args.body_file}", file=sys.stderr)
            sys.exit(1)
    elif args.body_stdin:
        audit_body = sys.stdin.read()
    
    create_log(
        args.mode,
        args.summary,
        args.files,
        args.next,
        args.impact,
        args.flags,
        args.tokens,
        audit_body,
        args.audit_type
    )