import { Delivery } from '../models/Delivery.js';
import { Donation } from '../models/Donation.js';
import { DeliveryPartnerProfile } from '../models/DeliveryPartnerProfile.js';
import { ReceiverProfile } from '../models/ReceiverProfile.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { User } from '../models/User.js';
import { ImpactMetric } from '../models/ImpactMetric.js';
import {
  DELIVERY_STATUS,
  DONATION_STATUS,
  validateDeliveryTransition,
  validateDonationTransition,
} from '../utils/stateMachines.js';
import { generateOTP, hashOTP, verifyOTP } from '../utils/crypto.js';
import { calculateHaversineDistanceKm, isWithinGeofence } from '../utils/geo.js';
import { ValidationError, ConflictError } from '../utils/errors.js';
import { recordAuditLog } from './auditService.js';
import { sendNotification } from './notificationService.js';
import {
  emitDeliveryStatus,
  emitDonationStatus,
  emitToRole,
} from '../sockets/socket.js';

/**
 * Create a Delivery task when a receiver accepts a matched donation
 */
export async function createDeliveryTask({ donationId, receiverId }) {
  const donation = await Donation.findById(donationId);
  if (!donation) throw new ValidationError('Donation not found');

  const receiverUser = await User.findById(receiverId);
  const receiverProfile = await ReceiverProfile.findOne({ userId: receiverId });
  const donorProfile = await DonorProfile.findOne({ userId: donation.donorId });

  const pickupCoords = donation.pickupLocation.coordinates;
  const dropCoords = receiverProfile?.location.coordinates || [75.87, 22.72];
  const distanceKm = calculateHaversineDistanceKm(pickupCoords, dropCoords);
  const estimatedDurationMinutes = Math.max(15, Math.round(distanceKm * 3.5)); // est 20km/h city speed

  // Generate OTPs for Donor (Pickup) and Receiver (Delivery)
  const pickupOTP = generateOTP();
  const deliveryOTP = generateOTP();

  donation.pickupOtpHash = hashOTP(pickupOTP);
  donation.deliveryOtpHash = hashOTP(deliveryOTP);
  donation.matchedReceiverId = receiverId;
  donation.status = DONATION_STATUS.MATCHED;
  await donation.save();

  const delivery = new Delivery({
    donationId: donation._id,
    receiverId,
    status: DELIVERY_STATUS.AVAILABLE,
    pickupLocation: {
      type: 'Point',
      coordinates: pickupCoords,
      address: donation.pickupLocation.address?.formattedAddress || 'Pickup Point',
      contactPerson: donorProfile?.contactPerson?.name || 'Donor Rep',
      contactPhone: donorProfile?.contactPerson?.phone || 'Confidential',
    },
    dropLocation: {
      type: 'Point',
      coordinates: dropCoords,
      address: receiverProfile?.address?.formattedAddress || 'Receiver Drop Point',
      contactPerson: receiverProfile?.contactPerson?.name || receiverUser?.name,
      contactPhone: receiverProfile?.contactPerson?.phone || 'Confidential',
    },
    distanceKm,
    estimatedDurationMinutes,
  });
  await delivery.save();

  donation.activeDeliveryId = delivery._id;
  await donation.save();

  await recordAuditLog({
    entityType: 'DELIVERY',
    entityId: delivery._id,
    action: 'DELIVERY_TASK_CREATED',
    performedBy: receiverId,
    performedByRole: 'RECEIVER',
    newState: { status: delivery.status, distanceKm },
    details: `Delivery task created for ${donation.foodName}. Distance: ${distanceKm} km.`,
  });

  // Notify delivery partners in the area
  await sendNotification({
    role: 'DELIVERY_PARTNER',
    title: 'New Delivery Request Available',
    message: `Pickup of ${donation.estimatedMeals} meals (${donation.foodName}) available ${distanceKm.toFixed(1)} km away.`,
    type: 'DELIVERY_ASSIGNED',
    link: `/delivery/requests`,
  });

  emitDeliveryStatus(delivery._id, delivery);
  emitDonationStatus(donation._id, donation);

  return { delivery, pickupOTP, deliveryOTP };
}

/**
 * Partner accepts an available delivery request
 */
export async function acceptDelivery(deliveryId, partnerId) {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) throw new ValidationError('Delivery not found');

  validateDeliveryTransition(delivery.status, DELIVERY_STATUS.ACCEPTED);

  const donation = await Donation.findById(delivery.donationId);
  validateDonationTransition(donation.status, DONATION_STATUS.PICKUP_ASSIGNED);

  delivery.partnerId = partnerId;
  delivery.status = DELIVERY_STATUS.ACCEPTED;
  delivery.acceptedAt = new Date();
  await delivery.save();

  donation.assignedPartnerId = partnerId;
  donation.status = DONATION_STATUS.PICKUP_ASSIGNED;
  await donation.save();

  await DeliveryPartnerProfile.findOneAndUpdate(
    { userId: partnerId },
    { activeDeliveryId: delivery._id }
  );

  await recordAuditLog({
    entityType: 'DELIVERY',
    entityId: delivery._id,
    action: 'PARTNER_ACCEPTED',
    performedBy: partnerId,
    performedByRole: 'DELIVERY_PARTNER',
    newState: { status: delivery.status, partnerId },
  });

  await sendNotification({
    userId: donation.donorId,
    role: 'DONOR',
    title: 'Delivery Partner Assigned',
    message: `A delivery partner has accepted your donation pickup for "${donation.foodName}".`,
    type: 'DELIVERY_UPDATE',
    link: `/donations/${donation._id}`,
  });

  emitDeliveryStatus(delivery._id, delivery);
  emitDonationStatus(donation._id, donation);

  return delivery;
}

/**
 * Partner confirms pickup with donor OTP + photo proof + geofence check
 */
export async function confirmPickup(deliveryId, partnerId, { otp, photoUrl, currentCoords }) {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) throw new ValidationError('Delivery not found');

  validateDeliveryTransition(delivery.status, DELIVERY_STATUS.PICKED_UP);

  const donation = await Donation.findById(delivery.donationId).select('+pickupOtpHash');
  validateDonationTransition(donation.status, DONATION_STATUS.PICKED_UP);

  // 1. Verify OTP
  const isOtpValid = verifyOTP(otp, donation.pickupOtpHash);
  if (!isOtpValid) {
    throw new ValidationError('Invalid Pickup OTP provided by donor.');
  }

  // 2. Geofence verification
  const geofencePassed = isWithinGeofence(currentCoords, delivery.pickupLocation.coordinates, 0.5);

  delivery.pickupProof = {
    photoUrl: photoUrl || '',
    otpVerified: true,
    timestamp: new Date(),
    locationCoordinates: currentCoords || delivery.pickupLocation.coordinates,
    geofenceVerified: geofencePassed,
  };
  delivery.status = DELIVERY_STATUS.PICKED_UP;
  delivery.pickedUpAt = new Date();
  await delivery.save();

  donation.status = DONATION_STATUS.PICKED_UP;
  await donation.save();

  // Progress to IN_TRANSIT
  delivery.status = DELIVERY_STATUS.IN_TRANSIT;
  await delivery.save();
  donation.status = DONATION_STATUS.IN_TRANSIT;
  await donation.save();

  await recordAuditLog({
    entityType: 'DELIVERY',
    entityId: delivery._id,
    action: 'FOOD_PICKED_UP_AND_IN_TRANSIT',
    performedBy: partnerId,
    performedByRole: 'DELIVERY_PARTNER',
    newState: { status: delivery.status, geofencePassed },
  });

  await sendNotification({
    userId: delivery.receiverId,
    role: 'RECEIVER',
    title: 'Food In Transit',
    message: `Delivery partner is on the way with ${donation.estimatedMeals} meals of "${donation.foodName}".`,
    type: 'DELIVERY_UPDATE',
    link: `/receiver/incoming`,
  });

  emitDeliveryStatus(delivery._id, delivery);
  emitDonationStatus(donation._id, donation);

  return delivery;
}

/**
 * Receiver confirms delivery with OTP + signature/photo proof
 */
export async function confirmDelivery(
  deliveryId,
  receiverId,
  { otp, signatureDataUrl, photoUrl, quantityReceivedMeals, conditionConfirmed, currentCoords }
) {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) throw new ValidationError('Delivery not found');

  validateDeliveryTransition(delivery.status, DELIVERY_STATUS.DELIVERED);

  const donation = await Donation.findById(delivery.donationId).select('+deliveryOtpHash');
  validateDonationTransition(donation.status, DONATION_STATUS.DELIVERED);

  // 1. Verify OTP
  const isOtpValid = verifyOTP(otp, donation.deliveryOtpHash);
  if (!isOtpValid) {
    throw new ValidationError('Invalid Delivery Confirmation OTP.');
  }

  const geofencePassed = isWithinGeofence(currentCoords, delivery.dropLocation.coordinates, 0.5);

  delivery.deliveryProof = {
    photoUrl: photoUrl || '',
    signatureDataUrl: signatureDataUrl || '',
    otpVerified: true,
    timestamp: new Date(),
    locationCoordinates: currentCoords || delivery.dropLocation.coordinates,
    geofenceVerified: geofencePassed,
    quantityReceivedMeals: quantityReceivedMeals || donation.estimatedMeals,
    conditionConfirmed: conditionConfirmed !== false,
  };
  delivery.status = DELIVERY_STATUS.DELIVERED;
  delivery.deliveredAt = new Date();
  await delivery.save();

  donation.status = DONATION_STATUS.COMPLETED;
  donation.completedAt = new Date();
  await donation.save();

  // Update Partner profile metrics
  if (delivery.partnerId) {
    await DeliveryPartnerProfile.findOneAndUpdate(
      { userId: delivery.partnerId },
      {
        $inc: {
          totalDeliveriesCompleted: 1,
          totalDistanceKm: delivery.distanceKm,
          totalMealsDelivered: donation.estimatedMeals,
        },
        $set: { activeDeliveryId: null },
      }
    );
  }

  // Update Donor Profile metrics
  await DonorProfile.findOneAndUpdate(
    { userId: donation.donorId },
    {
      $inc: {
        totalMealsDonated: donation.estimatedMeals,
        successfulDonationsCount: 1,
      },
    }
  );

  // Update Receiver Profile metrics
  await ReceiverProfile.findOneAndUpdate(
    { userId: receiverId },
    {
      $inc: {
        totalMealsReceived: donation.estimatedMeals,
        totalDeliveriesCompleted: 1,
        peopleServedEstimate: donation.estimatedMeals,
      },
    }
  );

  // Update Real-Time Environmental Impact Metrics
  // Formula: 1 meal ≈ 0.42 kg food waste.
  // 1 kg food waste diverted ≈ 2.5 kg CO2e diverted, 850 L water conserved
  const foodKg = donation.quantity || donation.estimatedMeals * 0.42;
  const co2Kg = foodKg * 2.5;
  const waterL = foodKg * 850;

  await ImpactMetric.create({
    totalFoodKg: foodKg,
    totalMealsServed: donation.estimatedMeals,
    co2EmissionsDivertedKg: co2Kg,
    waterConservedLiters: waterL,
    totalDonationsCompleted: 1,
  });

  await recordAuditLog({
    entityType: 'DONATION',
    entityId: donation._id,
    action: 'DONATION_COMPLETED_AND_DELIVERED',
    performedBy: receiverId,
    performedByRole: 'RECEIVER',
    newState: { status: donation.status, meals: donation.estimatedMeals },
    details: `Delivery successfully confirmed with OTP. Food delivered and completed.`,
  });

  // Notify all parties
  await sendNotification({
    userId: donation.donorId,
    role: 'DONOR',
    title: 'Donation Completed 🎉',
    message: `Your donation "${donation.foodName}" was successfully delivered! ${donation.estimatedMeals} meals served.`,
    type: 'DONATION_STATUS',
    link: `/donations/${donation._id}`,
  });

  emitDeliveryStatus(delivery._id, delivery);
  emitDonationStatus(donation._id, donation);

  return { delivery, donation };
}
