const bcrypt = require('bcryptjs');

const getSeedData = async () => {
  const salt = await bcrypt.genSalt(10);
  const ownerPassword = await bcrypt.hash('owner123', salt);
  const userPassword = await bcrypt.hash('user123', salt);

  const users = [
    {
      id: 1,
      name: 'Rajesh Sharma',
      email: 'owner@stayfinder.com',
      phone: '+91 98765 43210',
      password: ownerPassword,
      role: 'owner',
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya@stayfinder.com',
      phone: '+91 98765 12345',
      role: 'owner',
      password: ownerPassword,
    },
    {
      id: 3,
      name: 'Amit Verma',
      email: 'user@stayfinder.com',
      phone: '+91 98123 45678',
      role: 'user',
      password: userPassword,
    },
    {
      id: 4,
      name: 'Sneha Rao',
      email: 'sneha@stayfinder.com',
      phone: '+91 98234 56789',
      role: 'user',
      password: userPassword,
    },
  ];

  const properties = [
    {
      id: 1,
      owner_id: 1,
      name: 'GreenLeaf Luxury PG & Coliving',
      type: 'pg',
      description: 'Ultra-modern co-living space with high-speed 500Mbps WiFi, 3-times daily nutritious home-cooked meals, daily professional housekeeping, power backup, and rooftop chillout lounge. Ideal for IT professionals and college students.',
      address: 'Plot 42, 5th Cross, 6th Block, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560095',
      latitude: 12.93520000,
      longitude: 77.62450000,
      starting_price: 7500.00,
      status: 'available',
    },
    {
      id: 2,
      owner_id: 1,
      name: 'Sunshine Student & Working Men Hostel',
      type: 'hostel',
      description: 'Spacious and ventilated rooms located in the heart of HSR Sector 2. Walking distance to bus stop, tech parks, supermarkets, and gyms. Features dedicated biometric entry, study room, and laundry facilities.',
      address: '14th Main Road, Sector 2, HSR Layout',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560102',
      latitude: 12.91210000,
      longitude: 77.64460000,
      starting_price: 6000.00,
      status: 'available',
    },
    {
      id: 3,
      owner_id: 2,
      name: 'CyberNest Executive Co-living & PG',
      type: 'pg',
      description: 'Premium executive PG located right next to HITEC City & Inorbit Mall. Equipped with ergonomic work desks, high-speed fiber internet, AC rooms, gaming console lounge, and delicious South & North Indian buffets.',
      address: 'Lane 3, Vittal Rao Nagar, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      latitude: 17.44830000,
      longitude: 78.39150000,
      starting_price: 9000.00,
      status: 'available',
    },
    {
      id: 4,
      owner_id: 2,
      name: 'Sri Sai Balaji Men & Women Hostel',
      type: 'hostel',
      description: 'Affordable, clean, and highly secure hostel near DLF Cybercity & University of Hyderabad. 24x7 security guard, CCTV cameras, hot water geysers, purified RO drinking water, and bicycle parking.',
      address: 'Telecom Nagar, Gachibowli',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500032',
      latitude: 17.44010000,
      longitude: 78.34890000,
      starting_price: 5500.00,
      status: 'available',
    },
    {
      id: 5,
      owner_id: 1,
      name: 'Urban Comfort Suites & Hotel',
      type: 'hotel',
      description: 'Boutique hotel offering daily and weekly stay rooms with plush king and twin beds, smart LED TV, ensuite bathrooms, air conditioning, and room service. Perfect for business travelers and tourists.',
      address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560038',
      latitude: 12.97840000,
      longitude: 77.64080000,
      starting_price: 1800.00,
      status: 'available',
    },
    {
      id: 6,
      owner_id: 2,
      name: 'Serene Studio Private Rooms',
      type: 'room',
      description: 'Independent furnished rooms with attached balcony, private kitchen corner, and attached bath. Quiet residential neighborhood close to Hinjewadi IT Park and Pune-Bangalore highway.',
      address: 'Pan Card Club Road, Baner',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411045',
      latitude: 18.55970000,
      longitude: 73.77990000,
      starting_price: 11500.00,
      status: 'available',
    },
    {
      id: 7,
      owner_id: 1,
      name: 'Metroview Premium PG & Rooms',
      type: 'pg',
      description: 'Contemporary PG located just 300 meters from Hopefarm Metro Station. Features attached bathrooms for all rooms, lift, biometric security, gym, and washing machines.',
      address: 'ITPL Main Road, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      latitude: 12.96980000,
      longitude: 77.74990000,
      starting_price: 8000.00,
      status: 'available',
    },
    {
      id: 8,
      owner_id: 2,
      name: 'Shivaji Park Backpackers Hostel',
      type: 'hostel',
      description: 'Vibrant backpacker and youth hostel located near Dadar Beach and Shivaji Park. Ideal for interns, solo travelers, and students visiting Mumbai on a budget.',
      address: 'Ranade Road, Shivaji Park, Dadar West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400028',
      latitude: 19.02840000,
      longitude: 72.84060000,
      starting_price: 7000.00,
      status: 'available',
    },
  ];

  const images = [
    // Prop 1
    { property_id: 1, image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80' },
    { property_id: 1, image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80' },
    { property_id: 1, image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80' },
    // Prop 2
    { property_id: 2, image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80' },
    { property_id: 2, image_url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1000&q=80' },
    // Prop 3
    { property_id: 3, image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80' },
    { property_id: 3, image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80' },
    // Prop 4
    { property_id: 4, image_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80' },
    // Prop 5
    { property_id: 5, image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80' },
    { property_id: 5, image_url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80' },
    // Prop 6
    { property_id: 6, image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80' },
    // Prop 7
    { property_id: 7, image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80' },
    // Prop 8
    { property_id: 8, image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80' },
  ];

  const rooms = [
    // Prop 1 - GreenLeaf
    { property_id: 1, room_number: '101', sharing_type: 'Single sharing', total_beds: 1, occupied_beds: 0, price: 15000, ac: true, attached_bathroom: true, description: 'Spacious private master bedroom with balcony and dedicated study desk.' },
    { property_id: 1, room_number: '102', sharing_type: '2 sharing', total_beds: 2, occupied_beds: 1, price: 10500, ac: true, attached_bathroom: true, description: 'Twin sharing room with individual wardrobes and lockers.' },
    { property_id: 1, room_number: '103', sharing_type: '3 sharing', total_beds: 3, occupied_beds: 2, price: 8500, ac: false, attached_bathroom: true, description: 'Comfortable triple bed setup with wide windows.' },
    { property_id: 1, room_number: '104', sharing_type: '4 sharing', total_beds: 4, occupied_beds: 3, price: 7500, ac: false, attached_bathroom: true, description: 'Budget quad sharing with bunk beds and personal power outlets.' },

    // Prop 2 - Sunshine Hostel
    { property_id: 2, room_number: '201', sharing_type: '2 sharing', total_beds: 2, occupied_beds: 1, price: 8000, ac: false, attached_bathroom: true, description: 'Well ventilated 2 sharing room on 2nd floor.' },
    { property_id: 2, room_number: '202', sharing_type: '3 sharing', total_beds: 3, occupied_beds: 1, price: 7000, ac: false, attached_bathroom: true, description: '3 bedded room with study tables.' },
    { property_id: 2, room_number: '203', sharing_type: '4 sharing', total_beds: 4, occupied_beds: 2, price: 6000, ac: false, attached_bathroom: true, description: 'Spacious 4 sharing room with attached balcony.' },

    // Prop 3 - CyberNest
    { property_id: 3, room_number: 'A-101', sharing_type: 'Single sharing', total_beds: 1, occupied_beds: 1, price: 17000, ac: true, attached_bathroom: true, description: 'Executive single suite with Smart TV and mini fridge.' },
    { property_id: 3, room_number: 'A-102', sharing_type: '2 sharing', total_beds: 2, occupied_beds: 1, price: 12000, ac: true, attached_bathroom: true, description: 'Dual sharing luxury setup with split AC.' },
    { property_id: 3, room_number: 'A-103', sharing_type: '3 sharing', total_beds: 3, occupied_beds: 2, price: 9000, ac: true, attached_bathroom: true, description: 'Triple sharing with premium orthopedic mattresses.' },

    // Prop 4 - Sri Sai Balaji
    { property_id: 4, room_number: 'B-1', sharing_type: '2 sharing', total_beds: 2, occupied_beds: 2, price: 7000, ac: false, attached_bathroom: true, description: 'Fully occupied.' },
    { property_id: 4, room_number: 'B-2', sharing_type: '3 sharing', total_beds: 3, occupied_beds: 2, price: 6000, ac: false, attached_bathroom: true, description: '1 bed vacant.' },
    { property_id: 4, room_number: 'B-3', sharing_type: '4 sharing', total_beds: 4, occupied_beds: 3, price: 5500, ac: false, attached_bathroom: true, description: '1 bed vacant.' },

    // Prop 5 - Urban Comfort Suites Hotel
    { property_id: 5, room_number: 'Suite-01', sharing_type: 'Single sharing', total_beds: 1, occupied_beds: 0, price: 1800, ac: true, attached_bathroom: true, description: 'Deluxe private hotel room for 1 or 2 guests per night.' },
    { property_id: 5, room_number: 'Suite-02', sharing_type: '2 sharing', total_beds: 2, occupied_beds: 0, price: 2400, ac: true, attached_bathroom: true, description: 'Twin luxury beds with city view.' },

    // Prop 6 - Serene Studio Rooms
    { property_id: 6, room_number: 'Studio-1', sharing_type: 'Single sharing', total_beds: 1, occupied_beds: 0, price: 14000, ac: true, attached_bathroom: true, description: 'Private 1RK studio room with kitchenette.' },
    { property_id: 6, room_number: 'Studio-2', sharing_type: '2 sharing', total_beds: 2, occupied_beds: 1, price: 11500, ac: true, attached_bathroom: true, description: 'Furnished 2 bed studio apartment.' },

    // Prop 7 - Metroview
    { property_id: 7, room_number: 'M-1', sharing_type: 'Single sharing', total_beds: 1, occupied_beds: 0, price: 13500, ac: true, attached_bathroom: true, description: 'Quiet private room.' },
    { property_id: 7, room_number: 'M-2', sharing_type: '2 sharing', total_beds: 2, occupied_beds: 1, price: 9500, ac: true, attached_bathroom: true, description: '2 sharing room near lift.' },
    { property_id: 7, room_number: 'M-3', sharing_type: '3 sharing', total_beds: 3, occupied_beds: 1, price: 8000, ac: false, attached_bathroom: true, description: '3 sharing with large storage.' },

    // Prop 8 - Shivaji Park Hostel
    { property_id: 8, room_number: 'Dorm-A', sharing_type: '4 sharing', total_beds: 4, occupied_beds: 2, price: 7000, ac: true, attached_bathroom: true, description: 'Clean dorm style room.' },
  ];

  const standardFacilities = ['WiFi', 'AC', 'Parking', 'Laundry', 'CCTV', 'Power Backup', 'Hot Water', 'Housekeeping', 'Gym', 'Study Room', 'Common Room', 'Kitchen'];

  const facilities = [
    // Prop 1
    ...standardFacilities.map(f => ({ property_id: 1, facility_name: f })),
    // Prop 2
    ...['WiFi', 'Parking', 'Laundry', 'CCTV', 'Power Backup', 'Hot Water', 'Housekeeping', 'Study Room'].map(f => ({ property_id: 2, facility_name: f })),
    // Prop 3
    ...['WiFi', 'AC', 'Parking', 'Laundry', 'CCTV', 'Power Backup', 'Hot Water', 'Housekeeping', 'Gym', 'Common Room', 'Kitchen'].map(f => ({ property_id: 3, facility_name: f })),
    // Prop 4
    ...['WiFi', 'Parking', 'CCTV', 'Hot Water', 'Housekeeping', 'Power Backup'].map(f => ({ property_id: 4, facility_name: f })),
    // Prop 5
    ...['WiFi', 'AC', 'Parking', 'CCTV', 'Power Backup', 'Hot Water', 'Housekeeping'].map(f => ({ property_id: 5, facility_name: f })),
    // Prop 6
    ...['WiFi', 'AC', 'Parking', 'CCTV', 'Hot Water', 'Kitchen'].map(f => ({ property_id: 6, facility_name: f })),
    // Prop 7
    ...['WiFi', 'AC', 'Parking', 'Laundry', 'CCTV', 'Power Backup', 'Hot Water', 'Gym'].map(f => ({ property_id: 7, facility_name: f })),
    // Prop 8
    ...['WiFi', 'AC', 'CCTV', 'Hot Water', 'Common Room', 'Laundry'].map(f => ({ property_id: 8, facility_name: f })),
  ];

  const foodMenus = [
    // Prop 1 - GreenLeaf
    { property_id: 1, day: 'Monday', meal_type: 'Breakfast', menu: 'Idly + Sambar + Coconut Chutney + Tea/Coffee', start_time: '7:30 AM', end_time: '9:30 AM' },
    { property_id: 1, day: 'Monday', meal_type: 'Lunch', menu: 'Steamed Rice + Dal Tadka + Paneer Butter Masala + Curd', start_time: '12:30 PM', end_time: '2:30 PM' },
    { property_id: 1, day: 'Monday', meal_type: 'Dinner', menu: 'Hot Phulkas + Mixed Veg Curry + Jeera Rice + Rasam', start_time: '7:30 PM', end_time: '9:30 PM' },
    { property_id: 1, day: 'Tuesday', meal_type: 'Breakfast', menu: 'Poha + Boiled Sprouts / Banana + Tea/Coffee', start_time: '7:30 AM', end_time: '9:30 AM' },
    { property_id: 1, day: 'Tuesday', meal_type: 'Lunch', menu: 'Rice + Rajma Masala + Aloo Gobi + Pickle + Curd', start_time: '12:30 PM', end_time: '2:30 PM' },
    { property_id: 1, day: 'Tuesday', meal_type: 'Dinner', menu: 'Chapati + Dal Makhani + Rice + Gulab Jamun', start_time: '7:30 PM', end_time: '9:30 PM' },
    { property_id: 1, day: 'Wednesday', meal_type: 'Breakfast', menu: 'Upma + Coconut Chutney + Boiled Eggs / Fruit', start_time: '7:30 AM', end_time: '9:30 AM' },
    { property_id: 1, day: 'Wednesday', meal_type: 'Lunch', menu: 'Lemon Rice + Sambar + Potato Fry + Curd', start_time: '12:30 PM', end_time: '2:30 PM' },
    { property_id: 1, day: 'Wednesday', meal_type: 'Dinner', menu: 'Special Hyderabadi Dum Biryani (Veg/Chicken) + Raita + Salan', start_time: '8:00 PM', end_time: '10:00 PM' },
    { property_id: 1, day: 'Thursday', meal_type: 'Breakfast', menu: 'Aloo Paratha + Curd + Pickle + Tea', start_time: '7:30 AM', end_time: '9:30 AM' },
    { property_id: 1, day: 'Thursday', meal_type: 'Lunch', menu: 'Steamed Rice + Tomato Dal + Bhindi Fry + Buttermilk', start_time: '12:30 PM', end_time: '2:30 PM' },
    { property_id: 1, day: 'Thursday', meal_type: 'Dinner', menu: 'Roti + Chana Masala + Pulao + Sweet', start_time: '7:30 PM', end_time: '9:30 PM' },
    { property_id: 1, day: 'Friday', meal_type: 'Breakfast', menu: 'Uttapam + Sambhar + Red Chutney', start_time: '7:30 AM', end_time: '9:30 AM' },
    { property_id: 1, day: 'Friday', meal_type: 'Lunch', menu: 'Rice + Palak Dal + Egg / Paneer Bhurji', start_time: '12:30 PM', end_time: '2:30 PM' },
    { property_id: 1, day: 'Friday', meal_type: 'Dinner', menu: 'Poori + Chole Curry + Kheer', start_time: '7:30 PM', end_time: '9:30 PM' },
    { property_id: 1, day: 'Saturday', meal_type: 'Breakfast', menu: 'Poori + Masala Aloo Bhaji + Filter Coffee', start_time: '8:00 AM', end_time: '10:00 AM' },
    { property_id: 1, day: 'Saturday', meal_type: 'Lunch', menu: 'Curd Rice + Veg Pulao + Papad', start_time: '12:30 PM', end_time: '2:30 PM' },
    { property_id: 1, day: 'Saturday', meal_type: 'Dinner', menu: 'Roti + Paneer Kadhai + Ghee Rice + Ice Cream', start_time: '8:00 PM', end_time: '10:00 PM' },
    { property_id: 1, day: 'Sunday', meal_type: 'Breakfast', menu: 'Crispy Masala Dosa + Sambar + 2 Chutneys + Filter Coffee', start_time: '8:00 AM', end_time: '10:30 AM' },
    { property_id: 1, day: 'Sunday', meal_type: 'Lunch', menu: 'Grand Sunday Feast: Biryani + Paneer/Chicken Curry + Raita + Sweet', start_time: '1:00 PM', end_time: '3:00 PM' },
    { property_id: 1, day: 'Sunday', meal_type: 'Dinner', menu: 'Light Khichdi / Roti + Dal Fry + Papad', start_time: '7:30 PM', end_time: '9:30 PM' },

    // Prop 3 - CyberNest
    { property_id: 3, day: 'Monday', meal_type: 'Breakfast', menu: 'Vada + Sambar + Chutney + Fresh Juice', start_time: '7:00 AM', end_time: '9:30 AM' },
    { property_id: 3, day: 'Monday', meal_type: 'Lunch', menu: 'Basmati Rice + Dal Makhani + Paneer Tikka Masala', start_time: '12:30 PM', end_time: '2:30 PM' },
    { property_id: 3, day: 'Monday', meal_type: 'Dinner', menu: 'Butter Roti + Kadai Sabzi + Jeera Rice', start_time: '7:30 PM', end_time: '10:00 PM' },
  ];

  const rules = [
    // Prop 1
    { property_id: 1, rule_name: 'Entry Time', rule_value: 'By 10:30 PM' },
    { property_id: 1, rule_name: 'Exit / Outing Time', rule_value: 'Starts at 6:00 AM' },
    { property_id: 1, rule_name: 'Visitor Timings', rule_value: '10:00 AM - 7:00 PM (In common lounge only)' },
    { property_id: 1, rule_name: 'Curfew', rule_value: 'Main gates locked at 11:00 PM' },
    { property_id: 1, rule_name: 'Weekend Rules', rule_value: 'Night stays outside require digital notification in the portal' },
    { property_id: 1, rule_name: 'Smoking & Alcohol', rule_value: 'Strictly prohibited on property premises' },
    { property_id: 1, rule_name: 'Noise Policy', rule_value: 'Quiet hours after 10:30 PM' },

    // Prop 2
    { property_id: 2, rule_name: 'Entry Time', rule_value: 'By 10:00 PM' },
    { property_id: 2, rule_name: 'Exit Time', rule_value: '6:00 AM onwards' },
    { property_id: 2, rule_name: 'Visitor Timings', rule_value: 'Visiting lobby only between 9 AM and 6 PM' },
    { property_id: 2, rule_name: 'Curfew', rule_value: '10:30 PM' },

    // Prop 3
    { property_id: 3, rule_name: 'Entry Time', rule_value: 'Flexible with biometric 24x7 entry' },
    { property_id: 3, rule_name: 'Visitor Timings', rule_value: 'Guests allowed in cafeteria until 9:00 PM' },
    { property_id: 3, rule_name: 'Quiet Hours', rule_value: '11:00 PM to 6:00 AM' },
  ];

  const reviews = [
    {
      property_id: 1,
      user_id: 3,
      rating: 5,
      comment: 'Absolutely love living here! The food is super hygienic and tasty, just like home. WiFi is blazing fast for my WFH setup.',
    },
    {
      property_id: 1,
      user_id: 4,
      rating: 5,
      comment: 'Very safe, clean rooms, and courteous staff. The rooftop lounge is wonderful in the evenings.',
    },
    {
      property_id: 2,
      user_id: 3,
      rating: 4,
      comment: 'Great value for money in HSR Layout. Very peaceful for students and easy access to buses.',
    },
    {
      property_id: 3,
      user_id: 4,
      rating: 5,
      comment: 'Top-tier amenities in Madhapur! The gym and common areas are very well maintained.',
    },
  ];

  const wishlists = [
    { user_id: 3, property_id: 1 },
    { user_id: 3, property_id: 3 },
  ];

  return { users, properties, images, rooms, facilities, foodMenus, rules, reviews, wishlists };
};

module.exports = { getSeedData };
