#!/usr/bin/env python3
"""
Test script to debug Resend email functionality
"""

import os
from dotenv import load_dotenv

load_dotenv()

def test_resend():
    """Test Resend email sending functionality"""
    print("🧪 Testing Resend email functionality...")
    
    try:
        import resend
        print("✅ Resend library imported successfully")
        
        # Get API key from environment
        RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
        if not RESEND_API_KEY:
            print("❌ RESEND_API_KEY not found in environment variables")
            return False
            
        print(f"✅ API Key found: {RESEND_API_KEY[:10]}...")
        
        # Set API key
        resend.api_key = RESEND_API_KEY
        print("✅ API key set successfully")
        
        # Test email sending
        print("📧 Attempting to send test email...")
        
        result = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": "antonio.hewald3rd@perpetual.edu.ph",  # Your test email
            "subject": "🧪 Test Email from Ascended Tech Lab",
            "html": "<h1>Test Email</h1><p>This is a test email to verify Resend functionality.</p><p><strong>Verification Code: 123456</strong></p>"
        })
        
        print("✅ Email sent successfully!")
        print(f"📧 Resend response: {result}")
        return True
        
    except ImportError as e:
        print(f"❌ Failed to import Resend: {e}")
        return False
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        print(f"📋 Error type: {type(e)}")
        return False

if __name__ == '__main__':
    success = test_resend()
    if success:
        print("\n🎉 Resend functionality is working correctly!")
    else:
        print("\n❌ Resend functionality has issues that need to be resolved.")
