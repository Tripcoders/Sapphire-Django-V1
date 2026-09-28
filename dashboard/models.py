from django.db import models
from django.contrib.auth.models import User


class Activity(models.Model):
    TYPE_CHOICES = [
        ("quote", "Quote"),
        ("policy", "Policy"),
        ("lead", "Lead"),
    ]
    
    CHANNEL_CHOICES = [
        ("Branch", "Branch"),
        ("Website", "Website"),
        ("Referral", "Referral"),
        ("Boomerang", "Boomerang"),
        ("SAP", "SAP"),
        ("Social media", "Social media"),
    ]
    
    CHANNEL_ICONS = {
        "Branch": "building-2",
        "Website": "globe",
        "Referral": "handshake",
        "Boomerang": "message-circle",
        "SAP": "database",
        "Social media": "thumbs-up",
    }

    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    name = models.CharField(max_length=100)
    date = models.DateField()
    iso_date = models.DateField()
    number = models.CharField(max_length=50)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    channel_icon = models.CharField(max_length=30)
    id_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-iso_date', '-created_at']
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.name}"


class Client(models.Model):
    name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=20, unique=True)
    policies_count = models.PositiveIntegerField(default=0)
    quotes_count = models.PositiveIntegerField(default=0)
    leads_count = models.PositiveIntegerField(default=0)
    channel = models.CharField(max_length=20)
    channel_icon = models.CharField(max_length=30)
    initials = models.CharField(max_length=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    @property
    def kind(self):
        if self.policies_count > 0:
            return "policy"
        elif self.quotes_count > 0:
            return "quote"
        return "lead"


class Notification(models.Model):
    GROUP_CHOICES = [
        ("new", "New"),
        ("older", "Older"),
    ]
    
    ICON_CHOICES = [
        ("file-text", "File Text"),
        ("shield-check", "Shield Check"),
        ("message-circle", "Message Circle"),
        ("folder-open", "Folder Open"),
        ("wallet", "Wallet"),
        ("bell", "Bell"),
        ("user-check", "User Check"),
        ("check", "Check"),
        ("triangle-alert", "Triangle Alert"),
        ("layout-dashboard", "Layout Dashboard"),
    ]
    
    BG_COLORS = {
        "file-text": "rgba(0,145,255,.10)",
        "shield-check": "rgba(0,200,151,.12)",
        "message-circle": "rgba(124,58,237,.10)",
        "folder-open": "rgba(0,51,170,.08)",
        "wallet": "rgba(245,158,11,.15)",
        "bell": "rgba(0,51,170,.08)",
        "user-check": "rgba(124,58,237,.10)",
        "check": "rgba(0,200,151,.12)",
        "triangle-alert": "rgba(245,158,11,.15)",
        "layout-dashboard": "rgba(0,51,170,.08)",
    }
    
    FG_COLORS = {
        "file-text": "#0081e6",
        "shield-check": "#00916c",
        "message-circle": "#7c3aed",
        "folder-open": "#0033aa",
        "wallet": "#92400e",
        "bell": "#0033aa",
        "user-check": "#7c3aed",
        "check": "#00916c",
        "triangle-alert": "#92400e",
        "layout-dashboard": "#0033aa",
    }
    
    group = models.CharField(max_length=10, choices=GROUP_CHOICES, default="new")
    icon = models.CharField(max_length=30, choices=ICON_CHOICES)
    title = models.CharField(max_length=100)
    body = models.TextField()
    time = models.CharField(max_length=50)
    read = models.BooleanField(default=False)
    target = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def bg(self):
        return self.BG_COLORS.get(self.icon, "rgba(0,145,255,.10)")
    
    @property
    def fg(self):
        return self.FG_COLORS.get(self.icon, "#0081e6")