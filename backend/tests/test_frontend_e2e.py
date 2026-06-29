# E2E Playwright tests for Judicial Interpreter platform

import pytest
import os
from pathlib import Path

# Load REACT_APP_BACKEND_URL from frontend/.env if not present in environment
def get_base_url():
    url = os.environ.get('REACT_APP_BACKEND_URL')
    if not url:
        try:
            env_path = Path(__file__).resolve().parents[2] / 'frontend' / '.env'
            if env_path.exists():
                with open(env_path, 'r') as f:
                    for line in f:
                        if line.startswith('REACT_APP_BACKEND_URL='):
                            url = line.strip().split('=', 1)[1]
                            break
        except Exception:
            pass
    if not url:
        url = 'https://juge-interp-idf.preview.emergentagent.com'
    return url.rstrip('/')

BASE_URL = get_base_url()

def test_frontend_e2e_flow():
    """Verify all critical elements and links on the judicial interpreter vitrine site"""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        pytest.skip("playwright library is not installed in this environment")
        
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # 1. Desktop verification (1920x1080)
        page.set_viewport_size({"width": 1920, "height": 1080})
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        
        # Verify professional name and title in header
        name_el = page.locator('[data-testid="interpreter-professional-name"]')
        assert name_el.is_visible()
        assert "Marc LAURENT" in name_el.text_content()
        
        title_el = page.locator('[data-testid="interpreter-professional-title"]')
        assert title_el.is_visible()
        
        # Verify clickable phone link in header
        header_phone_el = page.locator('[data-testid="interpreter-header-phone-cta"]')
        assert header_phone_el.is_visible()
        phone_href = header_phone_el.get_attribute("href")
        assert phone_href.startswith("tel:")
        assert "+33612345678" in phone_href
        
        # 2. Verify Emergency Badge
        emergency_badge_el = page.locator('[data-testid="interpreter-emergency-badge"]')
        assert emergency_badge_el.is_visible()
        assert "24" in emergency_badge_el.text_content()
        
        # 3. Verify services
        services_list_el = page.locator('[data-testid="interpreter-services-list"]')
        assert services_list_el.is_visible()
        services_text = services_list_el.inner_html()
        assert "Garde" in services_text or "GAV" in services_text
        assert "Audition" in services_text or "libre" in services_text
        assert "Comparution" in services_text or "immédiate" in services_text
        
        # 4. Verify languages (Anglais, Arabe, Amazigh)
        languages_list_el = page.locator('[data-testid="interpreter-languages-list"]')
        assert languages_list_el.is_visible()
        languages_text = languages_list_el.text_content()
        assert "Anglais" in languages_text
        assert "Arabe" in languages_text
        assert "Amazigh" in languages_text
        
        # 5. Verify the expert and auto-entrepreneur mentions
        content = page.content()
        assert "Cour d" in content and "appel" in content
        assert "auto-entrepreneur" in content.lower() or "siret" in content.lower() or "entrepreneur" in content.lower()
        
        # 6. Verify Île-de-France departments covered
        zone_list_el = page.locator('[data-testid="interpreter-zone-list"]')
        assert zone_list_el.is_visible()
        zones_text = zone_list_el.text_content()
        for dept in ["75", "92", "93", "94", "77", "78", "91", "95"]:
            assert dept in zones_text
            
        # 7. Verify contact links
        phone_contact_el = page.locator('[data-testid="interpreter-phone-contact-link"]')
        assert phone_contact_el.is_visible()
        assert phone_contact_el.get_attribute("href").startswith("tel:")
        
        email_contact_el = page.locator('[data-testid="interpreter-email-contact-link"]')
        assert email_contact_el.is_visible()
        assert email_contact_el.get_attribute("href").startswith("mailto:")
        
        whatsapp_contact_el = page.locator('[data-testid="interpreter-whatsapp-contact-link"]')
        assert whatsapp_contact_el.is_visible()
        assert "wa.me" in whatsapp_contact_el.get_attribute("href") or "api.whatsapp.com" in whatsapp_contact_el.get_attribute("href")
        
        # 8. Verify absence of contact form
        assert page.locator("form").count() == 0
        assert page.locator("input[type='text'], input[type='email'], textarea").count() == 0
        
        # 9. Verify Emergency FAB is hidden on desktop
        fab_el = page.locator('[data-testid="interpreter-mobile-emergency-fab"]')
        assert not fab_el.is_visible()
        
        # 10. Verify Emergency FAB on mobile view (390x844)
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(200)
        page.evaluate("window.scrollTo(0, 500)")
        page.wait_for_timeout(200)
        assert fab_el.is_visible()
        assert fab_el.get_attribute("href").startswith("tel:")
        
        browser.close()
