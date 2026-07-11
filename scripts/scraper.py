"""
Partaj+ — Scraper automatique de deals
Extrait les codes promo de Radins.com et Poulpeo.be
"""

import json
import os
import re
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Installation des dépendances...")
    os.system("pip install requests beautifulsoup4")
    import requests
    from bs4 import BeautifulSoup


# ============================================
# CONFIGURATION
# ============================================
DATA_DIR = Path(__file__).parent.parent / "data"
DEALS_FILE = DATA_DIR / "deals.json"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


# ============================================
# SCRAPER RADINS.COM
# ============================================
def scrape_radins():
    """Extrait les deals de Radins.com (Belgique)"""
    deals = []
    urls = [
        "https://www.radins.com/codes-promo/belgique",
        "https://www.radins.com/bons-plans/belgique",
    ]

    for url in urls:
        try:
            response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=15)
            soup = BeautifulSoup(response.text, "html.parser")

            articles = soup.select("article, .deal-card, .promo-item, [class*='deal']")[:10]

            for article in articles:
                title_el = article.select_one("h2, h3, .title, [class*='title']")
                desc_el = article.select_one("p, .description, [class*='desc']")
                link_el = article.select_one("a[href]")
                code_el = article.select_one("[class*='code'], .code, code")

                if title_el:
                    title = title_el.get_text(strip=True)
                    desc = desc_el.get_text(strip=True) if desc_el else ""
                    link = link_el["href"] if link_el and link_el.get("href") else url
                    code = code_el.get_text(strip=True) if code_el else None

                    if not link.startswith("http"):
                        link = "https://www.radins.com" + link

                    deals.append({
                        "id": f"radins-{hashlib.md5(title.encode()).hexdigest()[:8]}",
                        "title": title[:80],
                        "description": desc[:150],
                        "emoji": "🏷️",
                        "category": "national",
                        "badge": "Radins",
                        "type": "code" if code else "link",
                        "url": link,
                        "code": code,
                        "discount": extract_discount(title + " " + desc),
                        "expiresAt": None,
                        "validated": False,
                        "featured": False,
                        "source": "radins.com"
                    })

            print(f"  ✅ Radins.com : {len(articles)} offres trouvées")
        except Exception as e:
            print(f"  ❌ Erreur Radins.com : {e}")

    return deals


# ============================================
# SCRAPER POULPEO.BE
# ============================================
def scrape_poulpeo():
    """Extrait les deals de Poulpeo.be"""
    deals = []
    url = "https://www.poulpeo.be/codes-promo"

    try:
        response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=15)
        soup = BeautifulSoup(response.text, "html.parser")

        articles = soup.select("article, .deal, .promo, [class*='offer']")[:10]

        for article in articles:
            title_el = article.select_one("h2, h3, .title, [class*='title']")
            desc_el = article.select_one("p, .description")
            link_el = article.select_one("a[href]")

            if title_el:
                title = title_el.get_text(strip=True)
                desc = desc_el.get_text(strip=True) if desc_el else ""
                link = link_el["href"] if link_el and link_el.get("href") else url

                if not link.startswith("http"):
                    link = "https://www.poulpeo.be" + link

                deals.append({
                    "id": f"poulpeo-{hashlib.md5(title.encode()).hexdigest()[:8]}",
                    "title": title[:80],
                    "description": desc[:150],
                    "emoji": "💰",
                    "category": "national",
                    "badge": "Poulpeo",
                    "type": "link",
                    "url": link,
                    "code": None,
                    "discount": extract_discount(title + " " + desc),
                    "expiresAt": None,
                    "validated": False,
                    "featured": False,
                    "source": "poulpeo.be"
                })

        print(f"  ✅ Poulpeo.be : {len(articles)} offres trouvées")
    except Exception as e:
        print(f"  ❌ Erreur Poulpeo.be : {e}")

    return deals


# ============================================
# SCRAPER GROUPON.BE
# ============================================
def scrape_groupon():
    """Extrait les deals de Groupon.be"""
    deals = []
    url = "https://www.groupon.be/coupons"

    try:
        response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=15)
        soup = BeautifulSoup(response.text, "html.parser")

        articles = soup.select("[class*='deal'], [class*='coupon'], [class*='offer']")[:10]

        for article in articles:
            title_el = article.select_one("h2, h3, .title, [class*='title']")
            desc_el = article.select_one("p, .description, [class*='desc']")

            if title_el:
                title = title_el.get_text(strip=True)
                desc = desc_el.get_text(strip=True) if desc_el else ""

                deals.append({
                    "id": f"groupon-{hashlib.md5(title.encode()).hexdigest()[:8]}",
                    "title": title[:80],
                    "description": desc[:150],
                    "emoji": "🎫",
                    "category": "flash",
                    "badge": "Groupon",
                    "type": "link",
                    "url": url,
                    "code": None,
                    "discount": extract_discount(title + " " + desc),
                    "expiresAt": (datetime.now() + timedelta(days=7)).isoformat(),
                    "validated": False,
                    "featured": False,
                    "source": "groupon.be"
                })

        print(f"  ✅ Groupon.be : {len(articles)} deals trouvés")
    except Exception as e:
        print(f"  ❌ Erreur Groupon.be : {e}")

    return deals


# ============================================
# UTILITAIRES
# ============================================
def extract_discount(text):
    """Extrait le pourcentage de réduction du texte"""
    patterns = [
        r"(-\d+%)",
        r"(\d+%\s*(?:de\s*)?réduction)",
        r"(jusqu'à\s*-\d+%)",
        r"(\d+€\s*(?:de\s*)?réduction)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return "Voir offre"


def load_existing_deals():
    """Charge les deals existants depuis le fichier JSON"""
    if DEALS_FILE.exists():
        with open(DEALS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"lastUpdated": "", "source": "auto", "deals": []}


def save_deals(data):
    """Sauvegarde les deals dans le fichier JSON"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    data["lastUpdated"] = datetime.now().isoformat()
    with open(DEALS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  💾 Sauvegardé : {DEALS_FILE}")


def merge_deals(existing, new_deals):
    """Fusionne les nouveaux deals avec les existants"""
    existing_ids = {d["id"] for d in existing["deals"]}
    added = 0

    for deal in new_deals:
        if deal["id"] not in existing_ids:
            existing["deals"].append(deal)
            existing_ids.add(deal["id"])
            added += 1

    # Supprimer les deals expirés
    now = datetime.now()
    before = len(existing["deals"])
    existing["deals"] = [
        d for d in existing["deals"]
        if not d.get("expiresAt") or datetime.fromisoformat(d["expiresAt"].replace("Z", "+00:00").split("+")[0]) > now
    ]
    expired = before - len(existing["deals"])

    print(f"  📊 Nouveaux : {added} | Expirés supprimés : {expired}")
    return existing


# ============================================
# MAIN
# ============================================
def main():
    print("🔍 Partaj+ — Scraper automatique de deals")
    print("=" * 50)

    # Charger les deals existants
    data = load_existing_deals()
    print(f"📂 Deals existants : {len(data['deals'])}")

    # Scraper toutes les sources
    print("\n🌐 Scraping en cours...")
    new_deals = []
    new_deals.extend(scrape_radins())
    new_deals.extend(scrape_poulpeo())
    new_deals.extend(scrape_groupon())

    print(f"\n📊 Total nouveaux deals trouvés : {len(new_deals)}")

    # Fusionner et sauvegarder
    data = merge_deals(data, new_deals)
    save_deals(data)

    print("\n✅ Terminé !")
    print(f"   Deals validés : {len([d for d in data['deals'] if d.get('validated')])}")
    print(f"   Deals en attente : {len([d for d in data['deals'] if not d.get('validated')])}")


if __name__ == "__main__":
    main()
