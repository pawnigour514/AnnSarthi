import axios from 'axios';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const client = axios.create({
  baseURL: config.AI_SERVICE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.AI_SERVICE_TOKEN}`,
  },
});

export const aiClient = {
  /**
   * Risk screening for donation
   */
  async screenFoodRisk(donationData, imageMetadata = []) {
    try {
      const response = await client.post('/risk-screening', {
        donation: donationData,
        images: imageMetadata,
      });
      return response.data;
    } catch (err) {
      logger.warn(`AI Service /risk-screening unreachable (${err.message}). Using local rule engine fallback.`);
      return null; // Signals caller to use local rule engine
    }
  },

  /**
   * Surplus forecast for recurring donor
   */
  async forecastSurplus(donorHistoryData) {
    try {
      const response = await client.post('/surplus-forecast', donorHistoryData);
      return response.data;
    } catch (err) {
      logger.warn(`AI Service /surplus-forecast unreachable (${err.message}). Using local baseline forecast.`);
      return null;
    }
  },

  /**
   * Demand forecast for receivers in an area
   */
  async forecastDemand(areaData) {
    try {
      const response = await client.post('/demand-forecast', areaData);
      return response.data;
    } catch (err) {
      logger.warn(`AI Service /demand-forecast unreachable (${err.message}).`);
      return null;
    }
  },

  /**
   * Route optimization with 2-opt
   */
  async optimizeRoute(stops) {
    try {
      const response = await client.post('/routing/optimize', { stops });
      return response.data;
    } catch (err) {
      logger.warn(`AI Service /routing/optimize unreachable (${err.message}).`);
      return null;
    }
  },

  /**
   * Fraud & Anomaly detection
   */
  async checkAnomaly(accountData) {
    try {
      const response = await client.post('/anomaly/check', accountData);
      return response.data;
    } catch (err) {
      logger.warn(`AI Service /anomaly/check unreachable (${err.message}).`);
      return null;
    }
  },
};
