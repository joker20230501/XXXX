import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { haversineDistanceKm } from '../utils/geo';

const prisma = new PrismaClient();

/**
 * Create a new job posting with mandatory transparent salary & skills
 */
export async function createJob(req: Request, res: Response) {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!company) {
      return res.status(400).json({ success: false, message: 'Vui lòng hoàn tất hồ sơ doanh nghiệp trước khi đăng tin' });
    }

    const {
      title,
      jobType,
      salaryMin,
      salaryMax,
      salaryType,
      isGross,
      requiredSkills,
      preferredSkills,
      benefits,
      description,
      workAddress,
      province,
      district,
      latitude,
      longitude,
    } = req.body;

    const job = await prisma.jobPosting.create({
      data: {
        companyId: company.id,
        title,
        jobType,
        salaryMin,
        salaryMax,
        salaryType,
        isGross,
        requiredSkills,
        preferredSkills,
        benefits,
        description,
        workAddress,
        province,
        district,
        latitude,
        longitude,
      },
      include: {
        company: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Đăng tin tuyển dụng thành công',
      data: job,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tạo tin tuyển dụng', error: error.message });
  }
}

/**
 * Get jobs on Map within Bounding Box or Radius
 */
export async function getJobsOnMap(req: Request, res: Response) {
  try {
    const {
      minLat,
      maxLat,
      minLng,
      maxLng,
      centerLat,
      centerLng,
      radiusKm = 10,
      skill,
      minSalary,
      maxSalary,
    } = req.query;

    const whereClause: any = { isActive: true };

    if (minLat && maxLat && minLng && maxLng) {
      whereClause.latitude = { gte: parseFloat(minLat as string), lte: parseFloat(maxLat as string) };
      whereClause.longitude = { gte: parseFloat(minLng as string), lte: parseFloat(maxLng as string) };
    }

    if (minSalary) {
      whereClause.salaryMax = { gte: parseFloat(minSalary as string) };
    }
    if (maxSalary) {
      whereClause.salaryMin = { lte: parseFloat(maxSalary as string) };
    }

    let jobs = await prisma.jobPosting.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            companyName: true,
            logoUrl: true,
            industry: true,
            isVerified: true,
          },
        },
      },
      take: 100,
    });

    // Filter by skill if requested
    if (skill) {
      const targetSkill = (skill as string).toLowerCase();
      jobs = jobs.filter((j) =>
        j.requiredSkills.some((s) => s.toLowerCase().includes(targetSkill)) ||
        j.preferredSkills.some((s) => s.toLowerCase().includes(targetSkill))
      );
    }

    // Add distance calculation if center point provided
    const jobsWithDistance = jobs.map((job) => {
      let distanceKm: number | null = null;
      if (centerLat && centerLng) {
        distanceKm = haversineDistanceKm(
          parseFloat(centerLat as string),
          parseFloat(centerLng as string),
          job.latitude,
          job.longitude
        );
      }
      return {
        ...job,
        distanceKm,
        displaySalary: `${Number(job.salaryMin).toLocaleString('vi-VN')} - ${Number(job.salaryMax).toLocaleString('vi-VN')} đ/${job.salaryType === 'MONTHLY' ? 'tháng' : job.salaryType === 'HOURLY' ? 'giờ' : 'ngày'}`,
      };
    });

    // Filter by radius if center point is specified
    const filteredJobs =
      centerLat && centerLng
        ? jobsWithDistance.filter((j) => j.distanceKm !== null && j.distanceKm <= parseFloat(radiusKm as string))
        : jobsWithDistance;

    return res.json({
      success: true,
      count: filteredJobs.length,
      data: filteredJobs,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải bản đồ việc làm', error: error.message });
  }
}

/**
 * Get Job Detail by ID
 */
export async function getJobDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    }

    // Increment view count asynchronously
    await prisma.jobPosting.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return res.json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải chi tiết công việc', error: error.message });
  }
}
