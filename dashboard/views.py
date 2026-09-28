"""Dashboard views - unified from Flask app."""
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
import json
import copy
from datetime import datetime

from .models import Activity, Client, Notification


# Sample data matching the original Flask app
SAMPLE_ACTIVITIES = [
    {"id": 1, "type": "quote", "name": "Cody Martin", "date": "31 Jan 2025", "iso": "2025-01-31", "number": "012345678910", "channel": "Branch", "channel_icon": "building-2", "id_number": "9311160103084"},
    {"id": 2, "type": "quote", "name": "Mike Strickland", "date": "31 Jan 2025", "iso": "2025-01-31", "number": "012345678911", "channel": "Website", "channel_icon": "globe", "id_number": "9308150103081"},
    {"id": 3, "type": "quote", "name": "Loretta Wong", "date": "31 Jul 2025", "iso": "2025-07-31", "number": "012345678912", "channel": "Social media", "channel_icon": "thumbs-up", "id_number": "9402010103082"},
    {"id": 4, "type": "policy", "name": "Gary Wallace", "date": "31 Jan 2025", "iso": "2025-01-31", "number": "POL-2025-0041", "channel": "Boomerang", "channel_icon": "message-circle", "id_number": "9311160103084"},
    {"id": 5, "type": "policy", "name": "Max Schmidt", "date": "31 Jan 2025", "iso": "2025-01-31", "number": "POL-2025-0042", "channel": "Referral", "channel_icon": "user-check", "id_number": "9205110103087"},
    {"id": 6, "type": "policy", "name": "Bryan Stewart", "date": "31 Jan 2025", "iso": "2025-01-31", "number": "POL-2025-0043", "channel": "Branch", "channel_icon": "building-2", "id_number": "9311160103084"},
    {"id": 7, "type": "policy", "name": "Phoebe Sharp", "date": "31 Jan 2025", "iso": "2025-01-31", "number": "POL-2025-0044", "channel": "Website", "channel_icon": "globe", "id_number": "9509020103089"},
    {"id": 8, "type": "policy", "name": "John Jacobs", "date": "31 Jan 2025", "iso": "2025-01-31", "number": "POL-2025-0045", "channel": "SAP", "channel_icon": "database", "id_number": "9311160103084"},
    {"id": 9, "type": "quote", "name": "Aisha Khan", "date": "02 Feb 2025", "iso": "2025-02-02", "number": "012345678913", "channel": "Website", "channel_icon": "globe", "id_number": "9604140103085"},
    {"id": 10, "type": "policy", "name": "Daniel Meyer", "date": "03 Feb 2025", "iso": "2025-02-03", "number": "POL-2025-0046", "channel": "Branch", "channel_icon": "building-2", "id_number": "9107190103083"},
    {"id": 11, "type": "lead", "name": "Sarah Naidoo", "date": "04 Feb 2025", "iso": "2025-02-04", "number": "LEAD-0091", "channel": "Referral", "channel_icon": "user-check", "id_number": "9708220103086"},
    {"id": 12, "type": "lead", "name": "Tom Becker", "date": "05 Feb 2025", "iso": "2025-02-05", "number": "LEAD-0092", "channel": "Social media", "channel_icon": "thumbs-up", "id_number": "9801010103080"},
    {"id": 13, "type": "quote", "name": "Nina Patel", "date": "06 Feb 2025", "iso": "2025-02-06", "number": "012345678914", "channel": "Branch", "channel_icon": "building-2", "id_number": "9903030103088"},
    {"id": 14, "type": "policy", "name": "Chris Evans", "date": "07 Feb 2025", "iso": "2025-02-07", "number": "POL-2025-0047", "channel": "SAP", "channel_icon": "database", "id_number": "9005150103084"},
    {"id": 15, "type": "policy", "name": "Lena Fischer", "date": "08 Feb 2025", "iso": "2025-02-08", "number": "POL-2025-0048", "channel": "Boomerang", "channel_icon": "message-circle", "id_number": "9106160103081"},
    {"id": 16, "type": "quote", "name": "Omar Farouk", "date": "09 Feb 2025", "iso": "2025-02-09", "number": "012345678915", "channel": "Website", "channel_icon": "globe", "id_number": "9207170103082"},
    {"id": 17, "type": "lead", "name": "Julia Botha", "date": "10 Feb 2025", "iso": "2025-02-10", "number": "LEAD-0093", "channel": "Website", "channel_icon": "globe", "id_number": "9308180103087"},
    {"id": 18, "type": "policy", "name": "Peter Novak", "date": "11 Feb 2025", "iso": "2025-02-11", "number": "POL-2025-0049", "channel": "Referral", "channel_icon": "user-check", "id_number": "9409190103083"},
    {"id": 19, "type": "quote", "name": "Emma Wilson", "date": "12 Feb 2025", "iso": "2025-02-12", "number": "012345678916", "channel": "Social media", "channel_icon": "thumbs-up", "id_number": "9510200103089"},
    {"id": 20, "type": "policy", "name": "David Kim", "date": "13 Feb 2025", "iso": "2025-02-13", "number": "POL-2025-0050", "channel": "Branch", "channel_icon": "building-2", "id_number": "9611210103084"},
    {"id": 21, "type": "lead", "name": "Zanele Dlamini", "date": "14 Feb 2025", "iso": "2025-02-14", "number": "LEAD-0094", "channel": "Boomerang", "channel_icon": "message-circle", "id_number": "9712220103086"},
    {"id": 22, "type": "quote", "name": "Lucas Meyer", "date": "15 Feb 2025", "iso": "2025-02-15", "number": "012345678917", "channel": "SAP", "channel_icon": "database", "id_number": "9811230103081"},
    {"id": 23, "type": "policy", "name": "Anna Botha", "date": "16 Feb 2025", "iso": "2025-02-16", "number": "POL-2025-0051", "channel": "Website", "channel_icon": "globe", "id_number": "9912240103088"},
    {"id": 24, "type": "lead", "name": "Kevin Petersen", "date": "17 Feb 2025", "iso": "2025-02-17", "number": "LEAD-0095", "channel": "Branch", "channel_icon": "building-2", "id_number": "9001250103085"},
]

PER_PAGE = 8


def query_activities(q="", tab="all", sort_by="name", sort_dir="asc", channel="all"):
    rows = copy.deepcopy(SAMPLE_ACTIVITIES)
    q = (q or "").strip().lower()
    if q:
        rows = [r for r in rows if q in r["name"].lower() or q in r["number"].lower()
                or q in r["id_number"].lower() or q in r["channel"].lower()]
    if tab in ("quote", "quotes"):
        rows = [r for r in rows if r["type"] == "quote"]
    elif tab in ("policy", "policies"):
        rows = [r for r in rows if r["type"] == "policy"]
    elif tab in ("lead", "leads"):
        rows = [r for r in rows if r["type"] == "lead"]
    if channel != "all":
        rows = [r for r in rows if r["channel"].lower() == channel.lower()]
    reverse = (sort_dir == "desc")
    if sort_by == "date":
        rows.sort(key=lambda r: r["iso"], reverse=reverse)
    else:
        rows.sort(key=lambda r: r["name"].lower(), reverse=reverse)
    return rows


def paginate(rows, page):
    total = len(rows)
    pages = max(1, (total + PER_PAGE - 1) // PER_PAGE)
    page = max(1, min(page, pages))
    start = (page - 1) * PER_PAGE
    end = start + PER_PAGE
    return rows[start:end], total, pages, page


def counts():
    return {
        "all": len(SAMPLE_ACTIVITIES),
        "quotes": len([r for r in SAMPLE_ACTIVITIES if r["type"] == "quote"]),
        "policies": len([r for r in SAMPLE_ACTIVITIES if r["type"] == "policy"]),
        "leads": len([r for r in SAMPLE_ACTIVITIES if r["type"] == "lead"]),
    }


@login_required
def index(request):
    """Main dashboard page."""
    q = request.GET.get("q", "")
    tab = request.GET.get("tab", "all")
    sort_by = request.GET.get("sort", "name")
    sort_dir = request.GET.get("dir", "asc")
    page = int(request.GET.get("page", 1) or 1)
    
    rows = query_activities(q, tab, sort_by, sort_dir)
    page_rows, total, pages, page = paginate(rows, page)
    
    pages_range = list(range(1, pages + 1))
    end_item = min(page * PER_PAGE, total)
    start_item = (page - 1) * PER_PAGE + 1 if total else 0
    context = {
        "rows": page_rows,
        "total": total,
        "pages": pages,
        "page": page,
        "per_page": PER_PAGE,
        "q": q,
        "tab": tab,
        "sort_by": sort_by,
        "sort_dir": sort_dir,
        "counts": counts(),
        "pages_range": pages_range,
        "start_item": start_item,
        "end_item": end_item,
    }
    return render(request, "dashboard.html", context)


def api_activities(request):
    """API endpoint for live search/pagination."""
    q = request.GET.get("q", "")
    tab = request.GET.get("tab", "all")
    sort_by = request.GET.get("sort", "name")
    sort_dir = request.GET.get("dir", "asc")
    channel = request.GET.get("channel", "all")
    page = int(request.GET.get("page", 1) or 1)
    
    rows = query_activities(q, tab, sort_by, sort_dir, channel)
    page_rows, total, pages, page = paginate(rows, page)
    start = (page - 1) * PER_PAGE + 1 if total else 0
    end = min(page * PER_PAGE, total)
    
    return JsonResponse({
        "rows": page_rows,
        "total": total,
        "pages": pages,
        "page": page,
        "per_page": PER_PAGE,
        "range": [start, end],
        "counts": counts(),
    })


@require_http_methods(["POST"])
def api_create_quote(request):
    """Create a new quote via AJAX."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "Invalid JSON"}, status=400)
    
    name = (data.get("name") or "New Customer").strip()
    channel = (data.get("channel") or "Branch").strip()
    id_number = data.get("id_number") or "9311160103084"
    
    icon_map = {
        "Branch": "building-2", "Website": "globe", "Social media": "thumbs-up",
        "Boomerang": "message-circle", "Referral": "user-check", "SAP": "database"
    }
    
    new_id = max(r["id"] for r in SAMPLE_ACTIVITIES) + 1
    row = {
        "id": new_id,
        "type": "quote",
        "name": name,
        "date": timezone.now().strftime("%d %b %Y"),
        "iso": timezone.now().strftime("%Y-%m-%d"),
        "number": f"0123456789{10 + new_id}",
        "channel": channel,
        "channel_icon": icon_map.get(channel, "building-2"),
        "id_number": id_number,
    }
    SAMPLE_ACTIVITIES.insert(0, row)
    
    return JsonResponse({"ok": True, "row": row, "counts": counts()}, status=201)


@require_http_methods(["POST"])
def api_create_claim(request):
    """Create a new claim via AJAX."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "Invalid JSON"}, status=400)
    
    name = (data.get("name") or "customer").strip()
    # In production, create actual claim record
    return JsonResponse({"ok": True, "message": f"Claim opened for {name}"}, status=201)


def api_clients(request):
    """Get all clients aggregated from activities."""
    seen = {}
    for r in SAMPLE_ACTIVITIES:
        key = r["name"].lower()
        entry = seen.setdefault(key, {
            "id": r["id"],
            "name": r["name"],
            "initials": "".join(w[0] for w in r["name"].split())[:2].upper(),
            "id_number": r["id_number"],
            "channel": r["channel"],
            "channel_icon": r["channel_icon"],
            "kind": "policy",
            "policies": 0,
            "quotes": 0,
            "leads": 0,
            "records": []
        })
        entry["records"].append(r)
        if r["type"] == "policy":
            entry["policies"] += 1
        elif r["type"] == "quote":
            entry["quotes"] += 1
        else:
            entry["leads"] += 1
    
    for c in seen.values():
        c["kind"] = "policy" if c["policies"] else ("quote" if c["quotes"] else "lead")
        c["id"] = c["records"][0]["id"]
    
    clients = sorted(seen.values(), key=lambda c: c["name"].lower())
    return JsonResponse({"clients": clients, "total": len(clients)})


def api_messages(request):
    """Get message threads."""
    threads = [
        {"id": 1, "name": "Cody Martin", "initials": "CM", "time": "9:41", "location": "Cape Town", "online": True,
         "important": False, "status": "open", "reason": "", "reminder": "",
         "preview": "Thanks! When will the quote be ready?",
         "messages": [{"mine": False, "text": "Hi, just checking on my motor quote."}, {"mine": True, "text": "Hi Cody, it will be ready by this afternoon."}, {"mine": False, "text": "Thanks! When will the quote be ready?"}]},
        {"id": 2, "name": "Gary Wallace", "initials": "GW", "time": "Yesterday", "location": "Johannesburg", "online": False,
         "important": True, "status": "pending", "reason": "Documentation outstanding", "reminder": "Tomorrow",
         "preview": "The claim documents are attached.",
         "messages": [{"mine": False, "text": "Hi, following up on claim CLM-2041."}, {"mine": False, "text": "The claim documents are attached."}]},
        {"id": 3, "name": "Branch team", "initials": "BT", "time": "Monday", "location": "Durban", "online": True,
         "important": False, "status": "resolved", "reason": "", "reminder": "",
         "preview": "New leads synced from the website.",
         "messages": [{"mine": False, "text": "Morning! New leads synced from the website."}, {"mine": True, "text": "Great, I will review them today."}]},
    ]
    return JsonResponse({"threads": threads})


@require_http_methods(["POST"])
def api_send_message(request):
    """Send a new message."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "Invalid JSON"}, status=400)
    
    to = (data.get("to") or "New contact").strip()
    body = (data.get("body") or "").strip() or "Hello!"
    
    # In a real app, save to database
    thread = {
        "id": 4,
        "name": to,
        "initials": "".join(w[0] for w in to.split())[:2].upper() or "NC",
        "time": "Now",
        "preview": body,
        "messages": [{"mine": True, "text": body}]
    }
    return JsonResponse({"ok": True, "thread": thread}, status=201)


@require_http_methods(["POST"])
def api_reply(request, tid):
    """Reply to a message thread."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "Invalid JSON"}, status=400)
    
    text = (data.get("text") or "").strip()
    if not text:
        return JsonResponse({"ok": False, "error": "Empty message"}, status=400)
    
    # In a real app, update the thread in database
    return JsonResponse({"ok": True})


def api_notifications(request):
    """Get notifications."""
    notifications = [
        {"id": 1, "group": "new", "icon": "file-text", "title": "New quote request", "body": "Loretta Wong requested a motor quote", "time": "12 min ago", "read": False, "target": {"page": "dashboard", "tab": "quotes", "record": "Loretta Wong"}},
        {"id": 2, "group": "new", "icon": "shield-check", "title": "Policy issued", "body": "POL-2025-0049 is now active for Peter Novak", "time": "1 hr ago", "read": False, "target": {"page": "policies", "record": "Peter Novak"}},
        {"id": 3, "group": "new", "icon": "message-circle", "title": "New message", "body": "Cody Martin: When will the quote be ready?", "time": "2 hrs ago", "read": False, "target": {"page": "messages", "thread": 1}},
        {"id": 4, "group": "new", "icon": "folder-open", "title": "Claim opened", "body": "New claim CLM-2041 for Gary Wallace", "time": "3 hrs ago", "read": False, "target": {"page": "dashboard", "record": "Gary Wallace"}},
        {"id": 5, "group": "new", "icon": "wallet", "title": "Payment received", "body": "R4,250 premium paid by David Kim", "time": "5 hrs ago", "read": False, "target": {"page": "policies", "record": "David Kim"}},
        {"id": 6, "group": "new", "icon": "bell", "title": "Renewal reminder", "body": "3 policies renew within 7 days", "time": "6 hrs ago", "read": False, "target": {"page": "policies"}},
        {"id": 7, "group": "older", "icon": "user-check", "title": "Lead assigned", "body": "Sarah Naidoo was assigned to you", "time": "Yesterday", "read": True, "target": {"page": "dashboard", "tab": "leads", "record": "Sarah Naidoo"}},
        {"id": 8, "group": "older", "icon": "file-warning", "title": "Document uploaded", "body": "Aisha Khan added proof of address", "time": "Yesterday", "read": True, "target": {"page": "dashboard", "record": "Aisha Khan"}},
        {"id": 9, "group": "older", "icon": "check", "title": "Chat resolved", "body": "Branch team conversation marked resolved", "time": "2 days ago", "read": True, "target": {"page": "messages", "thread": 3}},
        {"id": 10, "group": "older", "icon": "triangle-alert", "title": "Quote expiring", "body": "Omar Farouk quote expires on Friday", "time": "2 days ago", "read": True, "target": {"page": "dashboard", "tab": "quotes", "record": "Omar Farouk"}},
        {"id": 11, "group": "older", "icon": "shield-check", "title": "Policy renewed", "body": "POL-2025-0051 renewed for Anna Botha", "time": "3 days ago", "read": True, "target": {"page": "policies", "record": "Anna Botha"}},
        {"id": 12, "group": "older", "icon": "layout-dashboard", "title": "Weekly digest", "body": "Your Monday activity summary is ready", "time": "3 days ago", "read": True, "target": {"page": "dashboard"}},
    ]
    unread = len([n for n in notifications if not n["read"]])
    return JsonResponse({"notifications": notifications, "unread": unread})


@require_http_methods(["POST"])
def api_notification_read(request, nid):
    """Mark a notification as read."""
    # In a real app, update the notification in database
    return JsonResponse({"ok": True})


@require_http_methods(["POST"])
def api_notifications_read_all(request):
    """Mark all notifications as read."""
    return JsonResponse({"ok": True})