import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  BOGO = 'BUY_ONE_GET_ONE', // Buy one get one free
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableRoutes?: string[];
  applicableAirlines?: string[];
  firstTimeOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromoCodeValidationResult {
  valid: boolean;
  discountAmount?: number;
  finalAmount?: number;
  message?: string;
  promoCode?: PromoCode;
}

export class PromoCodeService {
  /**
   * Validate and apply promo code
   */
  static async validatePromoCode(
    code: string,
    userId: string,
    bookingAmount: number,
    route?: { origin: string; destination: string },
    airline?: string
  ): Promise<PromoCodeValidationResult> {
    try {
      // Find promo code (case-insensitive)
      const promoCode = await prisma.$queryRaw<any[]>`
        SELECT * FROM promo_codes 
        WHERE UPPER(code) = UPPER(${code})
        LIMIT 1
      `;

      if (!promoCode || promoCode.length === 0) {
        return {
          valid: false,
          message: 'Invalid promo code',
        };
      }

      const promo = promoCode[0];

      // Check if active
      if (!promo.isActive) {
        return {
          valid: false,
          message: 'This promo code is no longer active',
        };
      }

      // Check date validity
      const now = new Date();
      const validFrom = new Date(promo.validFrom);
      const validUntil = new Date(promo.validUntil);

      if (now < validFrom) {
        return {
          valid: false,
          message: `This promo code will be valid from ${validFrom.toLocaleDateString()}`,
        };
      }

      if (now > validUntil) {
        return {
          valid: false,
          message: 'This promo code has expired',
        };
      }

      // Check usage limit
      if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
        return {
          valid: false,
          message: 'This promo code has reached its usage limit',
        };
      }

      // Check per-user limit
      if (promo.perUserLimit) {
        const userUsageCount = await prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count FROM bookings 
          WHERE "userId" = ${userId} 
          AND "promoCodeId" = ${promo.id}
        `;

        if (userUsageCount[0].count >= promo.perUserLimit) {
          return {
            valid: false,
            message: 'You have already used this promo code the maximum number of times',
          };
        }
      }

      // Check first-time user only
      if (promo.firstTimeOnly) {
        const previousBookings = await prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count FROM bookings 
          WHERE "userId" = ${userId}
        `;

        if (previousBookings[0].count > 0) {
          return {
            valid: false,
            message: 'This promo code is only valid for first-time users',
          };
        }
      }

      // Check minimum purchase amount
      if (promo.minPurchaseAmount && bookingAmount < promo.minPurchaseAmount) {
        return {
          valid: false,
          message: `Minimum purchase amount of $${promo.minPurchaseAmount} required`,
        };
      }

      // Check route restrictions
      if (promo.applicableRoutes && route) {
        const routes = JSON.parse(promo.applicableRoutes);
        const routeKey = `${route.origin}-${route.destination}`;
        const reverseRouteKey = `${route.destination}-${route.origin}`;

        if (!routes.includes(routeKey) && !routes.includes(reverseRouteKey)) {
          return {
            valid: false,
            message: 'This promo code is not valid for this route',
          };
        }
      }

      // Check airline restrictions
      if (promo.applicableAirlines && airline) {
        const airlines = JSON.parse(promo.applicableAirlines);
        if (!airlines.includes(airline)) {
          return {
            valid: false,
            message: 'This promo code is not valid for this airline',
          };
        }
      }

      // Calculate discount
      let discountAmount = 0;

      if (promo.discountType === 'PERCENTAGE') {
        discountAmount = (bookingAmount * promo.discountValue) / 100;
      } else if (promo.discountType === 'FIXED_AMOUNT') {
        discountAmount = promo.discountValue;
      }

      // Apply max discount limit
      if (promo.maxDiscountAmount && discountAmount > promo.maxDiscountAmount) {
        discountAmount = promo.maxDiscountAmount;
      }

      // Ensure discount doesn't exceed booking amount
      if (discountAmount > bookingAmount) {
        discountAmount = bookingAmount;
      }

      const finalAmount = bookingAmount - discountAmount;

      return {
        valid: true,
        discountAmount,
        finalAmount,
        message: `Promo code applied! You saved $${discountAmount.toFixed(2)}`,
        promoCode: {
          id: promo.id,
          code: promo.code,
          description: promo.description,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          minPurchaseAmount: promo.minPurchaseAmount,
          maxDiscountAmount: promo.maxDiscountAmount,
          usageLimit: promo.usageLimit,
          usageCount: promo.usageCount,
          perUserLimit: promo.perUserLimit,
          validFrom: validFrom,
          validUntil: validUntil,
          isActive: promo.isActive,
          applicableRoutes: promo.applicableRoutes ? JSON.parse(promo.applicableRoutes) : undefined,
          applicableAirlines: promo.applicableAirlines ? JSON.parse(promo.applicableAirlines) : undefined,
          firstTimeOnly: promo.firstTimeOnly,
          createdAt: promo.createdAt,
          updatedAt: promo.updatedAt,
        },
      };
    } catch (error) {
      console.error('❌ Promo code validation error:', error);
      return {
        valid: false,
        message: 'Error validating promo code',
      };
    }
  }

  /**
   * Increment usage count when promo code is used
   */
  static async incrementUsageCount(promoCodeId: string): Promise<boolean> {
    try {
      await prisma.$executeRaw`
        UPDATE promo_codes 
        SET "usageCount" = "usageCount" + 1 
        WHERE id = ${promoCodeId}
      `;
      return true;
    } catch (error) {
      console.error('❌ Failed to increment usage count:', error);
      return false;
    }
  }

  /**
   * Get all active promo codes (admin)
   */
  static async getAllPromoCodes(includeInactive = false) {
    try {
      const query = includeInactive
        ? `SELECT * FROM promo_codes ORDER BY "createdAt" DESC`
        : `SELECT * FROM promo_codes WHERE "isActive" = true ORDER BY "createdAt" DESC`;

      const promoCodes = await prisma.$queryRawUnsafe<any[]>(query);
      return promoCodes;
    } catch (error) {
      console.error('❌ Failed to get promo codes:', error);
      return [];
    }
  }

  /**
   * Create new promo code (admin)
   */
  static async createPromoCode(data: {
    code: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    validFrom: Date;
    validUntil: Date;
    applicableRoutes?: string[];
    applicableAirlines?: string[];
    firstTimeOnly?: boolean;
  }) {
    try {
      const result = await prisma.$executeRaw`
        INSERT INTO promo_codes (
          code, description, "discountType", "discountValue",
          "minPurchaseAmount", "maxDiscountAmount",
          "usageLimit", "perUserLimit", "validFrom", "validUntil",
          "applicableRoutes", "applicableAirlines", "firstTimeOnly",
          "isActive", "usageCount", "createdAt", "updatedAt"
        ) VALUES (
          ${data.code.toUpperCase()},
          ${data.description},
          ${data.discountType},
          ${data.discountValue},
          ${data.minPurchaseAmount || null},
          ${data.maxDiscountAmount || null},
          ${data.usageLimit || null},
          ${data.perUserLimit || null},
          ${data.validFrom},
          ${data.validUntil},
          ${data.applicableRoutes ? JSON.stringify(data.applicableRoutes) : null},
          ${data.applicableAirlines ? JSON.stringify(data.applicableAirlines) : null},
          ${data.firstTimeOnly || false},
          true,
          0,
          NOW(),
          NOW()
        )
      `;

      console.log(`✅ Promo code created: ${data.code}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to create promo code:', error);
      return { success: false, error: 'Failed to create promo code' };
    }
  }

  /**
   * Update promo code (admin)
   */
  static async updatePromoCode(id: string, updates: Partial<PromoCode>) {
    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];

      if (updates.description !== undefined) {
        updateFields.push(`description = $${values.length + 1}`);
        values.push(updates.description);
      }

      if (updates.isActive !== undefined) {
        updateFields.push(`"isActive" = $${values.length + 1}`);
        values.push(updates.isActive);
      }

      if (updateFields.length === 0) {
        return { success: false, error: 'No updates provided' };
      }

      updateFields.push(`"updatedAt" = NOW()`);

      await prisma.$executeRawUnsafe(
        `UPDATE promo_codes SET ${updateFields.join(', ')} WHERE id = $${values.length + 1}`,
        ...values,
        id
      );

      console.log(`✅ Promo code updated: ${id}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to update promo code:', error);
      return { success: false, error: 'Failed to update promo code' };
    }
  }

  /**
   * Delete promo code (admin)
   */
  static async deletePromoCode(id: string) {
    try {
      await prisma.$executeRaw`
        DELETE FROM promo_codes WHERE id = ${id}
      `;

      console.log(`✅ Promo code deleted: ${id}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete promo code:', error);
      return { success: false, error: 'Failed to delete promo code' };
    }
  }

  /**
   * Get promo code statistics
   */
  static async getPromoCodeStats(promoCodeId: string) {
    try {
      const stats = await prisma.$queryRaw<any[]>`
        SELECT 
          pc.code,
          pc."usageCount",
          pc."usageLimit",
          COUNT(DISTINCT b."userId") as unique_users,
          COALESCE(SUM(b."totalAmount"), 0) as total_revenue,
          COALESCE(SUM(b."discountAmount"), 0) as total_discounts
        FROM promo_codes pc
        LEFT JOIN bookings b ON b."promoCodeId" = pc.id
        WHERE pc.id = ${promoCodeId}
        GROUP BY pc.id, pc.code, pc."usageCount", pc."usageLimit"
      `;

      return stats[0] || null;
    } catch (error) {
      console.error('❌ Failed to get promo code stats:', error);
      return null;
    }
  }
}

export default PromoCodeService;
