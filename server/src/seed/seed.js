import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { ReceiverProfile } from '../models/ReceiverProfile.js';
import { DeliveryPartnerProfile } from '../models/DeliveryPartnerProfile.js';
import { SafetyRuleConfig } from '../models/SafetyRuleConfig.js';
import { Donation } from '../models/Donation.js';
import { FoodSafetyAssessment } from '../models/FoodSafetyAssessment.js';
import { Requirement } from '../models/Requirement.js';
import { Match } from '../models/Match.js';
import { Delivery } from '../models/Delivery.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { ImpactMetric } from '../models/ImpactMetric.js';
import { logger } from '../utils/logger.js';
import { generateOTP, hashOTP } from '../utils/crypto.js';

export const DEMO_PASSWORD = 'DemoPassword123!';

// Indore MP coordinates & locations
const INDORE_LOCATIONS = [
  { name: 'Vijay Nagar Square', coords: [75.8937, 22.7533] },
  { name: 'Palasia Point', coords: [75.8824, 22.7244] },
  { name: 'Chappan Dukan', coords: [75.8775, 22.7249] },
  { name: 'Sarafa Bazaar', coords: [75.8577, 22.7196] },
  { name: 'Bhawarkua Square', coords: [75.8654, 22.6922] },
  { name: 'Rajwada Chowk', coords: [75.8569, 22.7183] },
  { name: 'Annapurna Road', coords: [75.8398, 22.7011] },
  { name: 'Geeta Bhawan Square', coords: [75.8841, 22.7156] },
  { name: 'Super Corridor Tech Hub', coords: [75.8201, 22.7758] },
  { name: 'Bapat Square', coords: [75.8745, 22.7601] },
  { name: 'Khandwa Road University', coords: [75.8732, 22.6841] },
  { name: 'Khajrana Temple Area', coords: [75.9082, 22.7302] },
];

export async function seedDemoDataIfEmpty() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    logger.info('Database empty. Automatically seeding realistic Indore ecosystem demo data...');
    await seedAll();
  }
}

export async function seedAll() {
  try {
    logger.info('Starting AnnSarthi Demo Database Seeding...');

    // Clean existing collections
    await Promise.all([
      User.deleteMany({}),
      DonorProfile.deleteMany({}),
      ReceiverProfile.deleteMany({}),
      DeliveryPartnerProfile.deleteMany({}),
      SafetyRuleConfig.deleteMany({}),
      Donation.deleteMany({}),
      FoodSafetyAssessment.deleteMany({}),
      Requirement.deleteMany({}),
      Match.deleteMany({}),
      Delivery.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      ImpactMetric.deleteMany({}),
    ]);

    // 1. Seed Food Safety Rules
    const safetyRules = await SafetyRuleConfig.create({
      name: 'Indore Municipal & FSSAI Aligned Baseline',
      autoVerifyLowRisk: true,
      minPickupWindowHours: 0.5,
      shelfLifeMatrixHours: {
        cookedMeal: { ambient: 4, refrigerated: 24, heated: 6 },
        dairyBakery: { ambient: 6, refrigerated: 36, heated: 4 },
        freshProduce: { ambient: 48, refrigerated: 96, heated: 12 },
        packagedDry: { ambient: 720, refrigerated: 720, heated: 24 },
      },
    });

    // 2. Seed Admins (2+)
    const adminUser = await User.create({
      name: 'Virendra Sharma (Head Coordinator)',
      email: 'admin@demo.annsarthi.app',
      password: DEMO_PASSWORD,
      role: 'ADMIN',
      phone: '+91 98260 11223',
      verificationStatus: 'VERIFIED',
      isEmailVerified: true,
    });

    const adminUser2 = await User.create({
      name: 'Sunita Mehra (Safety Compliance Officer)',
      email: 'safety-admin@demo.annsarthi.app',
      password: DEMO_PASSWORD,
      role: 'ADMIN',
      phone: '+91 98260 33445',
      verificationStatus: 'VERIFIED',
      isEmailVerified: true,
    });

    // 3. Seed Primary Demo Accounts
    const primaryDonorUser = await User.create({
      name: 'Rajputana Grand Hotel & Caterers',
      email: 'donor@demo.annsarthi.app',
      password: DEMO_PASSWORD,
      role: 'DONOR',
      phone: '+91 98261 44556',
      verificationStatus: 'VERIFIED',
      isEmailVerified: true,
    });
    const primaryDonorProfile = await DonorProfile.create({
      userId: primaryDonorUser._id,
      donorType: 'Hotel',
      orgName: 'Rajputana Grand Hotel & Caterers',
      fssaiLicenseNumber: '11422850000123',
      address: {
        street: 'AB Road, Near Vijay Nagar',
        landmark: 'Near Scheme 54',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452010',
        formattedAddress: 'Rajputana Grand Hotel, Vijay Nagar, Indore, MP',
      },
      location: { type: 'Point', coordinates: INDORE_LOCATIONS[0].coords },
      totalDonationsCount: 42,
      successfulDonationsCount: 40,
      totalMealsDonated: 3450,
      verifiedByAdmin: true,
    });

    const primaryPartnerUser = await User.create({
      name: 'Aakash Verma (Eco-Rider Logistics)',
      email: 'partner@demo.annsarthi.app',
      password: DEMO_PASSWORD,
      role: 'DELIVERY_PARTNER',
      phone: '+91 98262 55667',
      verificationStatus: 'VERIFIED',
      isEmailVerified: true,
    });
    const primaryPartnerProfile = await DeliveryPartnerProfile.create({
      userId: primaryPartnerUser._id,
      partnerType: 'volunteer',
      vehicleType: 'Two-Wheeler',
      vehicleNumber: 'MP-09-EV-8492',
      maxCapacityKg: 35,
      hasInsulatedBags: true,
      currentLocation: { type: 'Point', coordinates: INDORE_LOCATIONS[1].coords },
      totalDeliveriesCompleted: 38,
      totalDistanceKm: 215,
      totalMealsDelivered: 1890,
      rating: 4.95,
      verifiedByAdmin: true,
    });

    const primaryReceiverUser = await User.create({
      name: 'Asha Kiran Community Shelter & Food Bank',
      email: 'ngo@demo.annsarthi.app',
      password: DEMO_PASSWORD,
      role: 'RECEIVER',
      phone: '+91 98263 66778',
      verificationStatus: 'VERIFIED',
      isEmailVerified: true,
    });
    const primaryReceiverProfile = await ReceiverProfile.create({
      userId: primaryReceiverUser._id,
      receiverType: 'shelter',
      orgName: 'Asha Kiran Community Shelter & Food Bank',
      registrationNumber: 'MP/IND/NGO/2018/4910',
      dailyMealCapacity: 250,
      address: {
        street: '14/2 South Tukoganj, Near Geeta Bhawan',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452001',
        formattedAddress: 'Asha Kiran Shelter, South Tukoganj, Indore, MP',
      },
      location: { type: 'Point', coordinates: INDORE_LOCATIONS[7].coords },
      totalMealsReceived: 4120,
      totalDeliveriesCompleted: 45,
      peopleServedEstimate: 380,
      verifiedByAdmin: true,
    });

    // 4. Seed 11 More Donors (Varied types: College, Hostel, Wedding, Corporate, Store, etc.)
    const donorSeeds = [
      { name: 'Malwa Sweets & Restaurant', type: 'Restaurant', locIdx: 2 },
      { name: 'IIST College Central Mess', type: 'College', locIdx: 10 },
      { name: 'Sayaji Luxury Banquets', type: 'Wedding/Event organizer', locIdx: 0 },
      { name: 'TCS Indore Campus Cafeteria', type: 'Office/Corporate', locIdx: 8 },
      { name: 'Shri Gujrati Girls Hostel Mess', type: 'Hostel', locIdx: 6 },
      { name: 'Indore Fresh Mart & Bakery', type: 'Grocery/Food store', locIdx: 3 },
      { name: 'Delhi Public School Canteen', type: 'School', locIdx: 4 },
      { name: 'Brilliant Convention Centre', type: 'Wedding/Event organizer', locIdx: 0 },
      { name: 'Prashant Tiwari (Family Caterer)', type: 'Individual', locIdx: 5 },
      { name: 'Apollo Premier Executive Lounge', type: 'Hotel', locIdx: 1 },
      { name: 'Khandwa Sweets & Farsan', type: 'Restaurant', locIdx: 6 },
    ];

    const donorUsers = [primaryDonorUser];
    for (let i = 0; i < donorSeeds.length; i++) {
      const d = donorSeeds[i];
      const u = await User.create({
        name: d.name,
        email: `donor${i + 2}@demo.annsarthi.app`,
        password: DEMO_PASSWORD,
        role: 'DONOR',
        phone: `+91 98261 ${10000 + i * 111}`,
        verificationStatus: 'VERIFIED',
      });
      await DonorProfile.create({
        userId: u._id,
        donorType: d.type,
        orgName: d.name,
        address: { city: 'Indore', formattedAddress: `${d.name}, Indore` },
        location: { type: 'Point', coordinates: INDORE_LOCATIONS[d.locIdx].coords },
        totalDonationsCount: 15 + i * 3,
        totalMealsDonated: (15 + i * 3) * 60,
        verifiedByAdmin: true,
      });
      donorUsers.push(u);
    }

    // 5. Seed 11 More Receivers / NGOs
    const receiverSeeds = [
      { name: 'Roti Bank Indore Chapter', type: 'food bank', locIdx: 4, cap: 300 },
      { name: 'Snehalaya Children Orphanage', type: 'orphanage', locIdx: 6, cap: 120 },
      { name: 'Jan Kalyan Community Kitchen', type: 'community kitchen', locIdx: 5, cap: 220 },
      { name: 'Pavitra Seva Sansthan', type: 'NGO', locIdx: 11, cap: 180 },
      { name: 'Samarpan Night Shelter', type: 'shelter', locIdx: 3, cap: 140 },
      { name: 'Divyang Mitra Kalyan Kendra', type: 'verified community organization', locIdx: 7, cap: 90 },
      { name: 'Narmada Seva Aahar Trust', type: 'community kitchen', locIdx: 9, cap: 260 },
      { name: 'Udaan Youth Orphanage', type: 'orphanage', locIdx: 1, cap: 110 },
      { name: 'Mother Teresa Elders Home', type: 'shelter', locIdx: 6, cap: 80 },
      { name: 'Indore Relief Foundation', type: 'food bank', locIdx: 0, cap: 350 },
      { name: 'Prerna Slum Support Mission', type: 'NGO', locIdx: 10, cap: 160 },
    ];

    const receiverUsers = [primaryReceiverUser];
    for (let i = 0; i < receiverSeeds.length; i++) {
      const r = receiverSeeds[i];
      const u = await User.create({
        name: r.name,
        email: `ngo${i + 2}@demo.annsarthi.app`,
        password: DEMO_PASSWORD,
        role: 'RECEIVER',
        phone: `+91 98263 ${20000 + i * 111}`,
        verificationStatus: 'VERIFIED',
      });
      await ReceiverProfile.create({
        userId: u._id,
        receiverType: r.type,
        orgName: r.name,
        dailyMealCapacity: r.cap,
        address: { city: 'Indore', formattedAddress: `${r.name}, Indore` },
        location: { type: 'Point', coordinates: INDORE_LOCATIONS[r.locIdx].coords },
        totalMealsReceived: 2000 + i * 250,
        verifiedByAdmin: true,
      });
      receiverUsers.push(u);
    }

    // 6. Seed 11 More Delivery Partners
    const partnerSeeds = [
      { name: 'Rohan Sharma', veh: 'Two-Wheeler', locIdx: 0, type: 'volunteer' },
      { name: 'Pooja Deshmukh', veh: 'Two-Wheeler', locIdx: 2, type: 'volunteer' },
      { name: 'Vikram Rajput', veh: 'Three-Wheeler', locIdx: 4, type: 'NGO driver' },
      { name: 'Imran Khan', veh: 'Four-Wheeler/Van', locIdx: 5, type: 'logistics partner' },
      { name: 'Deepak Patidar', veh: 'Bicycle', locIdx: 3, type: 'volunteer' },
      { name: 'Kavita Joshi', veh: 'Two-Wheeler', locIdx: 7, type: 'volunteer' },
      { name: 'Manoj Chouhan', veh: 'Refrigerated Van', locIdx: 8, type: 'logistics partner' },
      { name: 'Sanjay Malviya', veh: 'Three-Wheeler', locIdx: 9, type: 'NGO driver' },
      { name: 'Anjali Saxena', veh: 'Two-Wheeler', locIdx: 1, type: 'volunteer' },
      { name: 'Gaurav Yadav', veh: 'Four-Wheeler/Van', locIdx: 10, type: 'logistics partner' },
      { name: 'Sunil Solanki', veh: 'Two-Wheeler', locIdx: 11, type: 'volunteer' },
    ];

    const partnerUsers = [primaryPartnerUser];
    for (let i = 0; i < partnerSeeds.length; i++) {
      const p = partnerSeeds[i];
      const u = await User.create({
        name: p.name,
        email: `partner${i + 2}@demo.annsarthi.app`,
        password: DEMO_PASSWORD,
        role: 'DELIVERY_PARTNER',
        phone: `+91 98262 ${30000 + i * 111}`,
        verificationStatus: 'VERIFIED',
      });
      await DeliveryPartnerProfile.create({
        userId: u._id,
        partnerType: p.type,
        vehicleType: p.veh,
        maxCapacityKg: p.veh.includes('Van') ? 120 : p.veh.includes('Three') ? 60 : 30,
        currentLocation: { type: 'Point', coordinates: INDORE_LOCATIONS[p.locIdx].coords },
        totalDeliveriesCompleted: 20 + i * 2,
        rating: 4.8 + (i % 3) * 0.08,
        verifiedByAdmin: true,
      });
      partnerUsers.push(u);
    }

    // 7. Seed Active Donations Across All Statuses with Real Safety Assessments
    const now = new Date();

    // A. LOW RISK & VERIFIED (Ready for matching)
    const don1 = await Donation.create({
      donorId: primaryDonorUser._id,
      foodName: 'Paneer Butter Masala & Rice Packets',
      category: 'cookedMeal',
      dietType: 'VEG',
      quantity: 45,
      unit: 'kg',
      estimatedMeals: 110,
      preparationDateTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hrs ago
      storageMethod: 'heated',
      packagingType: 'Food Grade Foil / Box',
      pickupDeadline: new Date(now.getTime() + 4 * 60 * 60 * 1000), // +4 hrs
      pickupLocation: {
        type: 'Point',
        coordinates: INDORE_LOCATIONS[0].coords,
        address: { formattedAddress: 'Vijay Nagar Banquet Hall, Indore' },
      },
      status: 'VERIFIED',
      riskLevel: 'LOW',
      notes: 'Freshly prepared evening banquet surplus. Hot insulated transport containers.',
    });
    const assess1 = await FoodSafetyAssessment.create({
      donationId: don1._id,
      riskLevel: 'LOW',
      score: 96,
      reasons: [
        'Preparation time within optimal heated shelf-life window (2.0 hrs elapsed of 6.0 hr limit).',
        'Certified food-grade foil packaging with thermal retention verified.',
        'Sufficient 4-hour redistribution window remaining.',
      ],
      requiredAction: 'AUTO_APPROVE',
      method: 'rule-based',
      confidence: 0.96,
      ruleResults: [
        {
          ruleCode: 'SHELF_LIFE_EXCEEDED',
          ruleName: 'Storage Duration Check',
          passed: true,
          severity: 'MANDATORY',
          message: 'Safe shelf life confirmed for heated storage.',
        },
        {
          ruleCode: 'PACKAGING_STANDARDS',
          ruleName: 'Food Grade Container Verification',
          passed: true,
          severity: 'INFO',
          message: 'Meets hygienic packaging guidelines.',
        },
      ],
      imageAnalysis: {
        blurScore: 520,
        isBlurry: false,
        brightness: 135,
        isOverOrUnderexposed: false,
        duplicateHashFound: false,
        notes: 'High clarity image. Food condition visually consistent with fresh hot banquet surplus.',
      },
    });
    don1.safetyAssessmentId = assess1._id;
    await don1.save();

    // B. MEDIUM RISK / REVIEW_REQUIRED (Flagged for Admin Review Queue)
    const don2 = await Donation.create({
      donorId: donorUsers[1]._id,
      foodName: 'Mixed Bakery Pastries & Sandwiches',
      category: 'dairyBakery',
      dietType: 'VEG',
      quantity: 25,
      unit: 'boxes',
      estimatedMeals: 75,
      preparationDateTime: new Date(now.getTime() - 5.5 * 60 * 60 * 1000), // 5.5 hrs ago
      storageMethod: 'ambient',
      packagingType: 'Clean Reusable Tray',
      pickupDeadline: new Date(now.getTime() + 1.2 * 60 * 60 * 1000),
      pickupLocation: {
        type: 'Point',
        coordinates: INDORE_LOCATIONS[2].coords,
        address: { formattedAddress: 'Chappan Dukan Bakery, Indore' },
      },
      status: 'REVIEW_REQUIRED',
      riskLevel: 'MEDIUM',
      notes: 'Bakery surplus. Custard and fresh cream items kept at room ambient temp.',
    });
    const assess2 = await FoodSafetyAssessment.create({
      donationId: don2._id,
      riskLevel: 'MEDIUM',
      score: 72,
      reasons: [
        'Elapsed ambient storage (5.5 hrs) is close to the 6.0-hour safety threshold for dairy items.',
        'Open reusable tray packaging requires verification of seal integrity.',
      ],
      requiredAction: 'MANUAL_REVIEW_REQUIRED',
      method: 'rule-based',
      confidence: 0.91,
      ruleResults: [
        {
          ruleCode: 'SHELF_LIFE_EXCEEDED',
          ruleName: 'Storage Duration Check',
          passed: true,
          severity: 'MANDATORY',
          message: 'Approaching maximum ambient storage limit for dairy.',
        },
        {
          ruleCode: 'PACKAGING_STANDARDS',
          ruleName: 'Packaging Material Conformity',
          passed: false,
          severity: 'WARNING',
          message: 'Reusable tray does not have hermetic seal.',
        },
      ],
    });
    don2.safetyAssessmentId = assess2._id;
    await don2.save();

    // C. HIGH RISK (Flagged for Admin Action)
    const don3 = await Donation.create({
      donorId: donorUsers[2]._id,
      foodName: 'Raw Seafood Platter Surplus',
      category: 'cookedMeal',
      dietType: 'NON_VEG',
      quantity: 15,
      unit: 'kg',
      estimatedMeals: 35,
      preparationDateTime: new Date(now.getTime() - 7 * 60 * 60 * 1000), // 7 hrs ago
      storageMethod: 'ambient',
      packagingType: 'Clean Reusable Tray',
      pickupDeadline: new Date(now.getTime() + 0.3 * 60 * 60 * 1000), // 18 mins left
      pickupLocation: {
        type: 'Point',
        coordinates: INDORE_LOCATIONS[3].coords,
        address: { formattedAddress: 'Sarafa Night Market Stall, Indore' },
      },
      status: 'REVIEW_REQUIRED',
      riskLevel: 'HIGH',
      notes: 'Unrefrigerated seafood from evening buffet.',
    });
    const assess3 = await FoodSafetyAssessment.create({
      donationId: don3._id,
      riskLevel: 'HIGH',
      score: 38,
      reasons: [
        'CRITICAL: Category is classified as high-risk perishable under food safety protocol.',
        'CRITICAL: Elapsed ambient time (7.0 hrs) exceeds permissible cooked/raw seafood threshold.',
        'CRITICAL: Pickup window (<20 mins) insufficient for safe temperature-controlled transit.',
      ],
      requiredAction: 'MANUAL_REVIEW_REQUIRED',
      method: 'rule-based',
      confidence: 0.98,
      ruleResults: [
        {
          ruleCode: 'SHELF_LIFE_EXCEEDED',
          ruleName: 'Perishable Ambient Exposure',
          passed: false,
          severity: 'MANDATORY',
          message: 'Unrefrigerated perishable exceeded safe window.',
        },
      ],
    });
    don3.safetyAssessmentId = assess3._id;
    await don3.save();

    // D. ACTIVE IN-TRANSIT DELIVERY
    const don4 = await Donation.create({
      donorId: primaryDonorUser._id,
      foodName: 'Dal Makhani, Jeera Rice & Phulkas',
      category: 'cookedMeal',
      dietType: 'VEG',
      quantity: 60,
      unit: 'meals',
      estimatedMeals: 150,
      preparationDateTime: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
      storageMethod: 'heated',
      packagingType: 'Airtight Container',
      pickupDeadline: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      pickupLocation: {
        type: 'Point',
        coordinates: INDORE_LOCATIONS[0].coords,
        address: { formattedAddress: 'Rajputana Grand Hotel, Vijay Nagar' },
      },
      status: 'IN_TRANSIT',
      riskLevel: 'LOW',
      matchedReceiverId: primaryReceiverUser._id,
      assignedPartnerId: primaryPartnerUser._id,
      pickupOtpHash: hashOTP('123456'),
      deliveryOtpHash: hashOTP('123456'),
    });
    const del4 = await Delivery.create({
      donationId: don4._id,
      partnerId: primaryPartnerUser._id,
      receiverId: primaryReceiverUser._id,
      status: 'IN_TRANSIT',
      pickupLocation: {
        type: 'Point',
        coordinates: INDORE_LOCATIONS[0].coords,
        address: 'Rajputana Grand Hotel, Vijay Nagar, Indore',
        contactPerson: 'Catering In-charge',
      },
      dropLocation: {
        type: 'Point',
        coordinates: INDORE_LOCATIONS[7].coords,
        address: 'Asha Kiran Shelter, South Tukoganj, Indore',
        contactPerson: 'Sister Maria',
      },
      distanceKm: 4.8,
      estimatedDurationMinutes: 18,
      pickupProof: {
        photoUrl: '/uploads/sample_pickup.jpg',
        otpVerified: true,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000),
        locationCoordinates: INDORE_LOCATIONS[0].coords,
        geofenceVerified: true,
      },
      currentPartnerLocation: {
        type: 'Point',
        coordinates: [75.888, 22.738], // Midpoint on way
        updatedAt: now,
      },
      assignedAt: new Date(now.getTime() - 40 * 60 * 1000),
      acceptedAt: new Date(now.getTime() - 35 * 60 * 1000),
      pickedUpAt: new Date(now.getTime() - 15 * 60 * 1000),
    });
    don4.activeDeliveryId = del4._id;
    await don4.save();

    // 8. Seed Open NGO Requirements
    await Requirement.create({
      receiverId: primaryReceiverUser._id,
      receiverProfileId: primaryReceiverProfile._id,
      foodCategory: 'cookedMeal',
      dietType: 'VEG',
      targetMeals: 150,
      requiredBy: new Date(now.getTime() + 5 * 60 * 60 * 1000),
      urgency: 'HIGH',
      status: 'OPEN',
      notes: 'Evening shelter dinner distribution. Require 150 nutritious hot meals.',
      location: { type: 'Point', coordinates: INDORE_LOCATIONS[7].coords },
    });

    await Requirement.create({
      receiverId: receiverUsers[1]._id,
      foodCategory: 'dairyBakery',
      dietType: 'VEG',
      targetMeals: 80,
      requiredBy: new Date(now.getTime() + 6 * 60 * 60 * 1000),
      urgency: 'MEDIUM',
      status: 'OPEN',
      notes: 'Breakfast pastries or buns for children home.',
      location: { type: 'Point', coordinates: INDORE_LOCATIONS[6].coords },
    });

    // 9. Seed Initial Notifications
    await Notification.create({
      userId: primaryDonorUser._id,
      role: 'DONOR',
      title: 'Donation Screened & Verified',
      message: 'Paneer Butter Masala has passed AI-assisted risk screening with score 96/100.',
      type: 'DONATION_STATUS',
      link: `/donations/${don1._id}`,
    });

    await Notification.create({
      userId: primaryPartnerUser._id,
      role: 'DELIVERY_PARTNER',
      title: 'Active Delivery in Progress',
      message: 'You have food in transit to Asha Kiran Shelter. ETA: 12 minutes.',
      type: 'DELIVERY_UPDATE',
      link: `/delivery/active`,
    });

    await Notification.create({
      role: 'ADMIN',
      title: 'High-Risk Food Alert',
      message: '1 donation flagged as HIGH risk (Raw Seafood Platter). Review required.',
      type: 'SAFETY_REVIEW',
      link: `/admin/safety-reviews`,
    });

    // 10. Seed Impact Metrics
    await ImpactMetric.create({
      totalFoodKg: 5985,
      totalMealsServed: 14250,
      co2EmissionsDivertedKg: 14962,
      waterConservedLiters: 5087250,
      landfillSpaceSavedM3: 10.8,
      totalDonationsCompleted: 182,
      isSyntheticDemoData: true,
    });

    logger.info('AnnSarthi demo database seeding completed successfully!');
    logger.info('Demo logins:');
    logger.info('Donor: donor@demo.annsarthi.app | Password: ' + DEMO_PASSWORD);
    logger.info('Partner: partner@demo.annsarthi.app | Password: ' + DEMO_PASSWORD);
    logger.info('Receiver: ngo@demo.annsarthi.app | Password: ' + DEMO_PASSWORD);
    logger.info('Admin: admin@demo.annsarthi.app | Password: ' + DEMO_PASSWORD);
  } catch (err) {
    logger.error(`Error seeding demo data: ${err.message}`);
    throw err;
  }
}

// Auto-run if executed directly as a script
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  import('../config/db.js').then(async ({ connectDB, disconnectDB }) => {
    try {
      await connectDB();
      await seedAll();
      logger.info('Seed process finished. Exiting...');
      process.exit(0);
    } catch (e) {
      logger.error(`Seed failed: ${e.message}`);
      process.exit(1);
    }
  });
}

