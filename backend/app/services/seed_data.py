from typing import Any, Dict, List
from sqlalchemy.orm import Session

from app.models.destination import Destination

DESTINATION_SEED_DATA: List[Dict[str, Any]] = [
    {
        "name": "Main Entrance / Gate",
        "slug": "main-entrance-gate",
        "category": "entrance",
        "description": "Main campus security gate and vehicular entrance from Dharmasthala road.",
        "building_name": None,
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Reception",
        "slug": "reception",
        "category": "administrative",
        "description": "Visitor registration, patient admission, and inquiries at entrance of Main Hospital A Block.",
        "building_name": "Main Hospital Block (A Block)",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Administrative Block",
        "slug": "administrative-block",
        "category": "administrative",
        "description": "Campus administration, superintendent, and executive offices inside Main Hospital A Block.",
        "building_name": "Main Hospital Block (A Block)",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Main Hospital Block (A Block)",
        "slug": "main-hospital-block-a-block",
        "category": "hospital",
        "description": "Primary healthcare facility housing reception, administration, general wards, treatment, and diagnostic labs.",
        "building_name": "Main Hospital Block (A Block)",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "B Block (Deluxe)",
        "slug": "b-block-deluxe",
        "category": "accommodation",
        "description": "Deluxe inpatient accommodation block adjacent to yoga halls.",
        "building_name": "B Block",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Special Ward",
        "slug": "special-ward",
        "category": "hospital",
        "description": "Specialized care and private inpatient ward facility.",
        "building_name": "Main Hospital Complex",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "General Wards",
        "slug": "general-wards",
        "category": "hospital",
        "description": "General inpatient wards located inside Main Hospital A Block.",
        "building_name": "Main Hospital Block (A Block)",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Treatment Section",
        "slug": "treatment-section",
        "category": "wellness",
        "description": "Naturopathy, hydrotherapy, and massage treatment section near Main Hospital Block.",
        "building_name": "Main Hospital Complex",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Laboratory",
        "slug": "laboratory",
        "category": "hospital",
        "description": "Clinical diagnostic and specimen testing laboratory inside Main Hospital A Block.",
        "building_name": "Main Hospital Block (A Block)",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Centre of Excellence",
        "slug": "centre-of-excellence",
        "category": "wellness",
        "description": "Advanced research and specialized naturopathy holistic wellness center (top-left).",
        "building_name": "Centre of Excellence",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Cottages (Priyamvada)",
        "slug": "cottages-priyamvada",
        "category": "accommodation",
        "description": "Serene residential cottages (former VIP Cottages) located in top-center campus grove.",
        "building_name": "Priyamvada Cottages",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Deluxe Rooms",
        "slug": "deluxe-rooms",
        "category": "accommodation",
        "description": "Deluxe room accommodations situated near cottage area (requires onsite verification).",
        "building_name": "Cottage Sector",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Special Rooms",
        "slug": "special-rooms",
        "category": "accommodation",
        "description": "Special inpatient rooms adjacent to A Block (requires onsite verification).",
        "building_name": "Main Hospital Sector",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Deluxe Cottages (Suragiri)",
        "slug": "deluxe-cottages-suragiri",
        "category": "accommodation",
        "description": "Upscale cottage enclave located south of hospital block.",
        "building_name": "Suragiri Cottages",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Special Cottages (Rajatagiri 1–14)",
        "slug": "special-cottages-rajatagiri",
        "category": "accommodation",
        "description": "Special residential cottages (Units 1–14) near B Block (requires onsite verification).",
        "building_name": "Rajatagiri Cottages",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Villa (Chaithanya)",
        "slug": "villa-chaithanya",
        "category": "accommodation",
        "description": "Independent premium villa accommodations located at south-east sector.",
        "building_name": "Chaithanya Villa",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Patanjali Yoga Hall",
        "slug": "patanjali-yoga-hall",
        "category": "yoga",
        "description": "Dedicated yoga practice and therapy hall near Main Hospital Block.",
        "building_name": "Yoga Complex",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Vasistha Yoga Hall",
        "slug": "vasistha-yoga-hall",
        "category": "yoga",
        "description": "Meditation and yogic kriya hall near Patanjali Hall.",
        "building_name": "Yoga Complex",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Thejas Yoga Hall",
        "slug": "thejas-yoga-hall",
        "category": "yoga",
        "description": "Yoga and wellness assembly hall by Main block (requires onsite verification).",
        "building_name": "Yoga Complex",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Kitchen & Dining Hall",
        "slug": "kitchen-dining-hall",
        "category": "amenity",
        "description": "Central dietary kitchen and pure sattvic dining hall for patients and guests.",
        "building_name": "Dining Complex",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Utility Shop",
        "slug": "utility-shop",
        "category": "amenity",
        "description": "Convenience, essentials, and herbal products store near Main Hospital Block (requires onsite verification).",
        "building_name": "Main Hospital Complex",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Swimming Pool",
        "slug": "swimming-pool",
        "category": "wellness",
        "description": "Hydrotherapy and recreational swimming pool area.",
        "building_name": None,
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Huts",
        "slug": "huts",
        "category": "wellness",
        "description": "Traditional natural eco-huts for outdoor therapy and relaxation.",
        "building_name": "Eco Huts Enclave",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Staff Quarters",
        "slug": "staff-quarters",
        "category": "administrative",
        "description": "Residential quarters for doctors, therapists, and hospital staff (requires onsite verification).",
        "building_name": "Staff Complex",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "Parking",
        "slug": "parking",
        "category": "amenity",
        "description": "Visitor, ambulance, and guest vehicular parking area.",
        "building_name": None,
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
    {
        "name": "STP (Sewage Treatment Plant)",
        "slug": "stp-sewage-treatment-plant",
        "category": "utility",
        "description": "Campus eco-friendly wastewater recycling and sewage treatment plant.",
        "building_name": "Utility Complex",
        "map_x": None,
        "map_y": None,
        "is_active": True,
        "is_verified": False,
    },
]


def seed_destinations(db: Session) -> Dict[str, int]:
    """
    Idempotently seeds the 26 Shanthivana campus destinations.
    Updates existing records matching by unique slug, inserts missing records.
    """
    created = 0
    updated = 0

    for item in DESTINATION_SEED_DATA:
        existing = db.query(Destination).filter(Destination.slug == item["slug"]).first()
        if existing:
            # Update fields while preserving id and timestamps
            existing.name = item["name"]
            existing.category = item["category"]
            existing.description = item["description"]
            existing.building_name = item["building_name"]
            existing.map_x = item["map_x"]
            existing.map_y = item["map_y"]
            existing.is_active = item["is_active"]
            existing.is_verified = item["is_verified"]
            updated += 1
        else:
            new_dest = Destination(
                name=item["name"],
                slug=item["slug"],
                category=item["category"],
                description=item["description"],
                building_name=item["building_name"],
                map_x=item["map_x"],
                map_y=item["map_y"],
                is_active=item["is_active"],
                is_verified=item["is_verified"],
            )
            db.add(new_dest)
            created += 1

    db.commit()
    return {
        "created": created,
        "updated": updated,
        "total": len(DESTINATION_SEED_DATA),
    }


if __name__ == "__main__":
    from app.core.database import SessionLocal

    print("Seeding Shanthivana campus destinations...")
    with SessionLocal() as db_session:
        res = seed_destinations(db_session)
        print(f"Seed complete: {res['created']} created, {res['updated']} updated (Total: {res['total']})")

