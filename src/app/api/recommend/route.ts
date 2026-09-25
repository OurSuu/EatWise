import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, request } = body;

    // 1. Nominatim API (Geocoding)
    let lat = 13.7384; 
    let lng = 100.5320;
    let locationName = request.area || 'Bangkok';

    if (locationName && locationName.trim() !== '') {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;
      const nomRes = await fetch(nominatimUrl, { headers: { 'User-Agent': 'EatWiseApp/1.0' } });
      const nomData = await nomRes.json();
      
      if (nomData && nomData.length > 0) {
        lat = parseFloat(nomData[0].lat);
        lng = parseFloat(nomData[0].lon);
      }
    }

    // 2. Nominatim API (หาร้านอาหารรอบๆ ฟรีและสเถียร 100%)
    let realRestaurants: any[] = [];
    
    // ค้นหาร้านอาหารเสมอ ไม่ว่าผู้ใช้จะเลือกแบบไหน เพื่อให้เห็นตัวอย่างการใช้ Map
    const poiUrl = `https://nominatim.openstreetmap.org/search?q=restaurant+near+${lat},${lng}&format=json&limit=50`;
    
    const opRes = await fetch(poiUrl, {
      headers: { 'User-Agent': 'EatWiseApp/1.0' }
    });

    if (opRes.ok) {
      const opData = await opRes.json();
      opData.forEach((el: any) => {
        const rLat = parseFloat(el.lat);
        const rLon = parseFloat(el.lon);
        const name = el.name || el.display_name?.split(',')[0] || '';
        
        // กรองเอาเฉพาะสถานที่ที่เป็นร้านอาหารจริงๆ (ไม่เอาถนน หรือตึกทั่วไป)
        const isAmenityFood = el.class === 'amenity' && ['restaurant', 'cafe', 'food_court', 'fast_food', 'bar', 'pub', 'ice_cream'].includes(el.type);
        const isShopFood = el.class === 'shop' && ['bakery', 'pastry', 'beverages', 'coffee', 'chocolate'].includes(el.type);
        const isFoodPlace = isAmenityFood || isShopFood;
        
        if (name && isFoodPlace && !isNaN(rLat) && !isNaN(rLon)) {
          // Haversine formula (straight-line)
          const R = 6371e3; // metres
          const φ1 = lat * Math.PI/180;
          const φ2 = rLat * Math.PI/180;
          const Δφ = (rLat-lat) * Math.PI/180;
          const Δλ = (rLon-lng) * Math.PI/180;
          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const straightDistance = Math.round(R * c);
          
          // คูณ 1.5 เพื่อชดเชยระยะทางเดินตามถนนจริงที่คดเคี้ยว และใช้ความเร็วเดิน 65 เมตร/นาที (เดินแบบชิลๆ)
          const distance = Math.round(straightDistance * 1.5);
          const walkTime = Math.ceil(distance / 65);
          
          // จำกัดระยะทางไม่เกิน 40 นาทีเดิน (ประมาณ 2.6 กิโลเมตร) 
          // เผื่อคนเรียกรถ หรือนั่งมอไซค์ จะได้ไม่ไกลเกินไป
          if (walkTime <= 40) {
            realRestaurants.push({
              name: name,
              lat: rLat,
              lng: rLon,
              time: walkTime,
              distance: distance
            });
          }
        }
      });
    }
    
    // Sort by distance and deduplicate names
    realRestaurants = realRestaurants.sort((a, b) => a.distance - b.distance);
    const uniqueNames = new Set();
    realRestaurants = realRestaurants.filter(r => {
      if (!uniqueNames.has(r.name)) {
        uniqueNames.add(r.name);
        return true;
      }
      return false;
    });

    // สุ่มเลือกร้าน 3 ร้าน จาก 20 ร้านที่ใกล้ที่สุด เพื่อให้กดปุ่มเปลี่ยนตัวเลือกได้
    let topPlaces = realRestaurants.slice(0, 20);
    topPlaces = topPlaces.sort(() => 0.5 - Math.random());

    // Helper for analyzing restaurant name to infer food type, buffet, price, and english name
    function analyzeRestaurant(name: string, budget: string) {
      const lowerName = name.toLowerCase();
      let foodType = "a la carte / general dishes";
      let isBuffet = false;
      let price = parseInt(budget) || 100;
      let englishName = "Local Restaurant";

      if (lowerName.includes('เฝอ')) { foodType = "Vietnamese Pho (Hot savory soup)"; englishName = "Authentic Vietnamese Pho"; }
      else if (lowerName.includes('curry') || lowerName.includes('แกงกะหรี่')) { foodType = "Rich Japanese Curry"; englishName = "Japanese Curry House"; }
      else if (lowerName.includes('mala') || lowerName.includes('หม่าล่า')) { foodType = "Spicy & Numbing Mala Hotpot"; englishName = "Mala Hotpot Spot"; }
      else if (lowerName.includes('ชาบู') || lowerName.includes('shabu') || lowerName.includes('สุกี้')) { foodType = "Shabu / Suki Hotpot"; englishName = "Shabu Shabu Hotpot"; }
      else if (lowerName.includes('ปิ้งย่าง') || lowerName.includes('yakiniku') || lowerName.includes('หมูกระทะ')) { foodType = "Thai BBQ / Yakiniku"; englishName = "Thai BBQ Grill"; }
      else if (lowerName.includes('ก๋วยเตี๋ยว') || lowerName.includes('noodle')) { foodType = "Local Noodle Soup"; englishName = "Local Noodle Shop"; }
      else if (lowerName.includes('สเต็ก') || lowerName.includes('steak')) { foodType = "Juicy Steak & Grill"; englishName = "Steakhouse"; }
      else if (lowerName.includes('คาเฟ่') || lowerName.includes('cafe') || lowerName.includes('coffee')) { foodType = "Cafe treats and beverages"; englishName = "Cozy Cafe"; }
      else if (lowerName.includes('ตำ') || lowerName.includes('ยำ') || lowerName.includes('แซ่บ')) { foodType = "Spicy Thai Salads (Somtum/Yum)"; englishName = "Spicy Somtum House"; }

      if (lowerName.includes('บุฟเฟต์') || lowerName.includes('บุฟเฟ่ต์') || lowerName.includes('buffet') || lowerName.includes('ตี๋น้อย')) {
        isBuffet = true;
        englishName += " (Buffet)";
        price = price > 200 ? price : 259; 
      }

      // Check if there is a specific price in the name (e.g. "บุฟเฟต์ 99")
      const priceMatch = name.match(/\b\d{2,3}\b/);
      if (priceMatch) {
        price = parseInt(priceMatch[0]);
      }

      // If the original name contains English words (like "Gold Curry"), use them
      const engMatch = name.match(/[a-zA-Z]+/g);
      if (engMatch && engMatch.length > 0) {
        englishName = name; // Just use the real name if it's already English
      }

      return { foodType, isBuffet, price, englishName };
    }

    // 3. Create 3 options based on real restaurants
    const options = [];
    
    if (topPlaces.length >= 2) {
      const r1 = topPlaces[0];
      const r2 = topPlaces[1];
      const r3 = topPlaces.length > 2 ? topPlaces[2] : null;

      const a1 = analyzeRestaurant(r1.name, request.budget);
      options.push({
        medal: "🥇",
        name: a1.englishName, 
        cost: a1.price,
        time: r1.time,
        cook: "No",
        ingredients: `Specialty: ${a1.foodType}`,
        nutrition: { cals: a1.isBuffet ? 800 : 450, p: 25, c: 50, f: 12 },
        explanation: `🌟 Chef's Review: This place is fantastic! They serve **${a1.foodType}**. ${a1.isBuffet ? 'The best part is it is an **All-You-Can-Eat Buffet**!' : 'The portions are great.'} Estimated cost is around **${a1.price} THB**/person. Highly recommended!`,
        restaurants: [ { name: r1.name, travelTime: `~${r1.time} mins walk`, note: "Top match for you!", lat: r1.lat, lng: r1.lng } ]
      });

      const a2 = analyzeRestaurant(r2.name, request.budget);
      options.push({
        medal: "🥈",
        name: a2.englishName, 
        cost: a2.price,
        time: r2.time,
        cook: "No",
        ingredients: `Style: ${a2.foodType}`,
        nutrition: { cals: a2.isBuffet ? 800 : 320, p: 30, c: 35, f: 8 },
        explanation: `🌟 Chef's Review: A solid alternative! This spot focuses on **${a2.foodType}**. ${a2.isBuffet ? 'Enjoy endless food with their **Buffet**!' : 'Very budget-friendly.'} Expect to spend around **${a2.price} THB**. Definitely worth checking out.`,
        restaurants: [ { name: r2.name, travelTime: `~${r2.time} mins walk`, note: "Great alternative choice.", lat: r2.lat, lng: r2.lng } ]
      });

      if (r3) {
         const a3 = analyzeRestaurant(r3.name, request.budget);
         options.push({
          medal: "🥉",
          name: a3.englishName, 
          cost: a3.price,
          time: r3.time,
          cook: "No",
          ingredients: `Highlight: ${a3.foodType}`,
          nutrition: { cals: a3.isBuffet ? 800 : 550, p: 20, c: 60, f: 15 },
          explanation: `🌟 Chef's Review: Foodies should consider this! It is a **${a3.foodType}** joint. ${a3.isBuffet ? 'Get ready for a **Buffet** feast!' : ''} Estimated at **${a3.price} THB**. A bit of a trip, but the taste makes up for it.`,
          restaurants: [ { name: r3.name, travelTime: `~${r3.time} mins walk`, note: "Popular local spot.", lat: r3.lat, lng: r3.lng } ] 
        });
      }
    }

    // Fallback if no restaurants found AT ALL
    if (options.length === 0) {
      options.push({
        medal: "💡",
        name: request.cravings ? `${request.cravings} (Home Cook)` : "Quick Healthy Scramble",
        cost: 40,
        time: 15,
        cook: "Yes",
        ingredients: request.ingredients || "Eggs, Veggies, Rice",
        nutrition: { cals: 300, p: 20, c: 10, f: 10 },
        explanation: `We couldn't find any mapped restaurants near ${locationName}. How about cooking this simple dish at home?`,
        restaurants: []
      });
      options.push({
        medal: "💡",
        name: "Creative Salad Bowl",
        cost: 60,
        time: 10,
        cook: "Yes",
        ingredients: "Mixed greens, protein of choice",
        nutrition: { cals: 250, p: 15, c: 15, f: 12 },
        explanation: `Another home-cooked option since no nearby restaurants were found.`,
        restaurants: []
      });
      options.push({
        medal: "💡",
        name: "Quick Sandwiches",
        cost: 50,
        time: 5,
        cook: "Yes",
        ingredients: "Bread, cheese, meat",
        nutrition: { cals: 400, p: 18, c: 35, f: 15 },
        explanation: `A fast and easy option to make at home.`,
        restaurants: []
      });
    }

    return NextResponse.json({ status: 'success', options });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
