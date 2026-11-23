const { Op } = require('sequelize');
const { getModels } = require('../models');
const { calculateHaversineDistance } = require('../utils/distance');

/**
 * Service to process and filter properties
 */
class PropertyService {
  /**
   * Search and filter properties
   */
  static async searchProperties(query, currentUserId = null) {
    const {
      search,
      city,
      type,
      minPrice,
      maxPrice,
      sharing,
      facilities,
      food,
      latitude,
      longitude,
      radius,
      sortBy = 'newest',
      page = 1,
      limit = 9,
    } = query;

    const { Property, PropertyImage, Room, Facility, FoodMenu, Review, Wishlist, User } = getModels();

    // Base where conditions for Property
    const whereConditions = {};

    if (type && type !== 'all') {
      whereConditions.type = type.toLowerCase();
    }

    if (city) {
      whereConditions.city = { [Op.like]: `%${city.trim()}%` };
    }

    if (search) {
      const searchTerm = `%${search.trim()}%`;
      whereConditions[Op.or] = [
        { name: { [Op.like]: searchTerm } },
        { address: { [Op.like]: searchTerm } },
        { city: { [Op.like]: searchTerm } },
      ];
    }

    // Tenant budgets apply to the actual per-bed monthly room price, not a property-level teaser price.
    const hasRoomPriceFilter = minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '';
    const roomPriceWhere = {};
    if (hasRoomPriceFilter) {
      if (minPrice !== undefined && minPrice !== '') roomPriceWhere[Op.gte] = parseFloat(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') roomPriceWhere[Op.lte] = parseFloat(maxPrice);
    }

    // Room include condition if sharing filter is applied
    const roomWhere = {};
    if (hasRoomPriceFilter) roomWhere.price = roomPriceWhere;
    if (sharing) {
      const sharingArr = Array.isArray(sharing) ? sharing : sharing.split(',');
      const sharingConditions = sharingArr.map((s) => ({
        sharing_type: { [Op.like]: `%${s.trim()}%` },
      }));
      roomWhere[Op.or] = sharingConditions;
    }

    // Facility filter condition
    let facilityRequired = false;
    const facilityWhere = {};
    if (facilities) {
      const facilityArr = Array.isArray(facilities) ? facilities : facilities.split(',');
      facilityWhere.facility_name = {
        [Op.in]: facilityArr.map((f) => f.trim()),
      };
      facilityRequired = true;
    }

    // Query all matching properties with their relations
    const properties = await Property.findAll({
      where: whereConditions,
      include: [
        {
          model: PropertyImage,
          as: 'images',
          attributes: ['id', 'image_url'],
        },
        {
          model: Room,
          as: 'rooms',
          where: Object.keys(roomWhere).length > 0 ? roomWhere : undefined,
          required: Object.keys(roomWhere).length > 0,
        },
        {
          model: FoodMenu,
          as: 'food_menus',
          attributes: ['id'],
        },
        {
          model: Facility,
          as: 'facilities',
          where: Object.keys(facilityWhere).length > 0 ? facilityWhere : undefined,
          required: facilityRequired,
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['id', 'rating'],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'phone', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const userLat = latitude ? parseFloat(latitude) : null;
    const userLng = longitude ? parseFloat(longitude) : null;
    const maxRadius = radius ? parseFloat(radius) : null;

    // Process and format each property
    let processed = properties.map((prop) => {
      const propData = prop.toJSON();

      // Bed and room aggregation
      const rooms = (propData.rooms || []).map((room) => ({ ...room, available_beds: Math.max(0, Number(room.total_beds || 0) - Number(room.occupied_beds || 0)) })).filter((room) => room.available_beds > 0);
      let totalBeds = 0;
      let occupiedBeds = 0;
      const sharingTypes = new Set();

      rooms.forEach((r) => {
        totalBeds += r.total_beds || 0;
        occupiedBeds += r.occupied_beds || 0;
        if (r.sharing_type) sharingTypes.add(r.sharing_type);
      });

      const availableBeds = Math.max(0, totalBeds - occupiedBeds);

      // Reviews & Rating
      const reviews = propData.reviews || [];
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? Math.round((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount) * 10) / 10
          : 0;

      // Distance calculation
      let distance = null;
      if (userLat !== null && userLng !== null) {
        distance = calculateHaversineDistance(
          userLat,
          userLng,
          parseFloat(propData.latitude),
          parseFloat(propData.longitude)
        );
      }

      // Check food menu availability
      const hasFood = Boolean((propData.food_menus || []).length) || Boolean(
        (propData.facilities || []).some((f) =>
          f.facility_name.toLowerCase().includes('food') ||
          f.facility_name.toLowerCase().includes('mess') ||
          f.facility_name.toLowerCase().includes('kitchen')
        )
      );

      return {
        ...propData,
        rooms,
        total_beds: totalBeds,
        occupied_beds: occupiedBeds,
        available_beds: availableBeds,
        sharing_options: Array.from(sharingTypes),
        average_rating: avgRating,
        review_count: reviewCount,
        distance,
        has_food: hasFood,
        // Display the cheapest currently bookable room option as the starting monthly price.
        starting_price: rooms.length ? Math.min(...rooms.map((room) => Number(room.price))) : Number(propData.starting_price || 0),
      };
    });

    // Never advertise a property as available when every matching room is full.
    processed = processed.filter((property) => property.rooms && property.rooms.length > 0);

    // Filter by food if requested
    if (food === 'true' || food === true) {
      processed = processed.filter((p) => p.has_food);
    }

    // Filter by radius if user coords and radius are provided
    if (maxRadius && userLat !== null && userLng !== null) {
      processed = processed.filter((p) => p.distance !== null && p.distance <= maxRadius);
    }

    // Sorting
    if (sortBy === 'distance' && userLat !== null && userLng !== null) {
      processed.sort((a, b) => (a.distance ?? 999999) - (b.distance ?? 999999));
    } else if (sortBy === 'price_asc') {
      processed.sort((a, b) => parseFloat(a.starting_price) - parseFloat(b.starting_price));
    } else if (sortBy === 'price_desc') {
      processed.sort((a, b) => parseFloat(b.starting_price) - parseFloat(a.starting_price));
    } else if (sortBy === 'rating') {
      processed.sort((a, b) => b.average_rating - a.average_rating);
    }

    // Check wishlist for current user if logged in
    if (currentUserId) {
      const wishlists = await Wishlist.findAll({
        where: { user_id: currentUserId },
        attributes: ['property_id'],
      });
      const wishlistedSet = new Set(wishlists.map((w) => w.property_id));
      processed = processed.map((p) => ({
        ...p,
        is_wishlisted: wishlistedSet.has(p.id),
      }));
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const totalCount = processed.length;
    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = processed.slice(startIndex, startIndex + limitNum);

    return {
      properties: paginatedItems,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    };
  }
}

module.exports = PropertyService;
