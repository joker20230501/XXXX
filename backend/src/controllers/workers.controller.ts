import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateFuzzyCoordinates, haversineDistanceKm } from '../utils/geo';

const prisma = new PrismaClient();

/**
 * Upsert structured CV profile for Worker
 */
export async function saveWorkerProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const {
      fullName,
      avatarUrl,
      expectedSalaryMin,
      expectedSalaryMax,
      salaryType,
      experienceYears,
      bio,
      province,
      district,
      skills,
      certificates,
      exactLatitude,
      exactLongitude,
    } = req.body;

    // Generate fuzzed coordinates for map visualization to protect user privacy
    const fuzzy = generateFuzzyCoordinates(exactLatitude, exactLongitude);

    const profile = await prisma.workerProfile.upsert({
      where: { userId },
      update: {
        fullName,
        avatarUrl,
        expectedSalaryMin,
        expectedSalaryMax,
        salaryType,
        experienceYears,
        bio,
        province,
        district,
        skills,
        certificates,
        exactLatitude,
        exactLongitude,
        fuzzyLatitude: fuzzy.lat,
        fuzzyLongitude: fuzzy.lon,
        isLookingForJob: true,
      },
      create: {
        userId,
        fullName,
        avatarUrl,
        expectedSalaryMin,
        expectedSalaryMax,
        salaryType,
        experienceYears,
        bio,
        province,
        district,
        skills,
        certificates,
        exactLatitude,
        exactLongitude,
        fuzzyLatitude: fuzzy.lat,
        fuzzyLongitude: fuzzy.lon,
        isLookingForJob: true,
      },
    });

    return res.json({
      success: true,
      message: 'Cập nhật hồ sơ năng lực thành công',
      data: profile,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật hồ sơ', error: error.message });
  }
}

/**
 * Get Worker Profile by token
 */
export async function getMyProfile(req: Request, res: Response) {
  try {
    const profile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Chưa tạo hồ sơ người tìm việc' });
    }

    return res.json({ success: true, data: profile });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải hồ sơ', error: error.message });
  }
}

/**
 * Employer searches workers on map
 * IMPORTANT: Returns ONLY fuzzyLatitude/fuzzyLongitude and masks sensitive personal data
 */
export async function getWorkersOnMap(req: Request, res: Response) {
  try {
    const { centerLat, centerLng, radiusKm = 10, skill } = req.query;

    const workers = await prisma.workerProfile.findMany({
      where: { isLookingForJob: true },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        fuzzyLatitude: true,
        fuzzyLongitude: true,
        province: true,
        district: true,
        skills: true,
        certificates: true,
        experienceYears: true,
        expectedSalaryMin: true,
        expectedSalaryMax: true,
        salaryType: true,
        createdAt: true,
      },
      take: 100,
    });

    let filtered = workers;

    // Filter by skill
    if (skill) {
      const targetSkill = (skill as string).toLowerCase();
      filtered = filtered.filter((w) =>
        w.skills.some((s) => s.toLowerCase().includes(targetSkill))
      );
    }

    // Mask name for privacy (e.g., "Nguyễn Văn A" -> "Nguyễn V. ***")
    const sanitized = filtered.map((w) => {
      const nameParts = w.fullName.trim().split(' ');
      const maskedName =
        nameParts.length > 1
          ? `${nameParts[0]} ${nameParts[1].charAt(0)}. ***`
          : `${w.fullName.charAt(0)}***`;

      let distanceKm: number | null = null;
      if (centerLat && centerLng) {
        distanceKm = haversineDistanceKm(
          parseFloat(centerLat as string),
          parseFloat(centerLng as string),
          w.fuzzyLatitude,
          w.fuzzyLongitude
        );
      }

      return {
        id: w.id,
        displayName: maskedName,
        avatarUrl: w.avatarUrl,
        latitude: w.fuzzyLatitude,
        longitude: w.fuzzyLongitude,
        province: w.province,
        district: w.district,
        skills: w.skills,
        certificates: w.certificates,
        experienceYears: w.experienceYears,
        expectedSalaryRange: `${Number(w.expectedSalaryMin).toLocaleString('vi-VN')} - ${Number(w.expectedSalaryMax).toLocaleString('vi-VN')} đ/tháng`,
        distanceKm,
      };
    });

    const result =
      centerLat && centerLng
        ? sanitized.filter((w) => w.distanceKm !== null && w.distanceKm <= parseFloat(radiusKm as string))
        : sanitized;

    return res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải bản đồ nhân tài', error: error.message });
  }
}
