import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateMatchScore } from '../utils/geo';

const prisma = new PrismaClient();

/**
 * Smart Job recommendations for a worker based on location, skills, and salary
 */
export async function getSmartMatchesForWorker(req: Request, res: Response) {
  try {
    const worker = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!worker) {
      return res.status(400).json({ success: false, message: 'Vui lòng hoàn thiện hồ sơ trước' });
    }

    const jobs = await prisma.jobPosting.findMany({
      where: { isActive: true },
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
    });

    const rankedJobs = jobs.map((job) => {
      const matchResult = calculateMatchScore(
        job.latitude,
        job.longitude,
        Number(job.salaryMin),
        Number(job.salaryMax),
        job.requiredSkills,
        worker.exactLatitude,
        worker.exactLongitude,
        Number(worker.expectedSalaryMin),
        Number(worker.expectedSalaryMax),
        worker.skills
      );

      return {
        ...job,
        displaySalary: `${Number(job.salaryMin).toLocaleString('vi-VN')} - ${Number(job.salaryMax).toLocaleString('vi-VN')} đ/tháng`,
        matchScore: matchResult.score,
        distanceKm: matchResult.distanceKm,
        matchedSkills: matchResult.matchedSkills,
      };
    });

    // Sort by match score descending
    rankedJobs.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      success: true,
      count: rankedJobs.length,
      data: rankedJobs.slice(0, 20),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tính toán độ phù hợp', error: error.message });
  }
}

/**
 * Apply to a Job
 */
export async function applyJob(req: Request, res: Response) {
  try {
    const { jobId, note } = req.body;
    const worker = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!worker) {
      return res.status(400).json({ success: false, message: 'Vui lòng tạo hồ sơ ứng viên trước khi ứng tuyển' });
    }

    const application = await prisma.jobApplication.upsert({
      where: {
        jobId_workerProfileId: {
          jobId,
          workerProfileId: worker.id,
        },
      },
      update: { note, status: 'PENDING' },
      create: {
        jobId,
        workerProfileId: worker.id,
        note,
        status: 'PENDING',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.',
      data: application,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi ứng tuyển', error: error.message });
  }
}

/**
 * Employer unlocks candidate contact info upon mutual interest / application
 */
export async function unlockCandidateContact(req: Request, res: Response) {
  try {
    const { applicationId } = req.body;

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        workerProfile: {
          include: {
            user: {
              select: { phone: true, email: true },
            },
          },
        },
        job: {
          include: { company: true },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ ứng tuyển' });
    }

    // Verify company ownership
    if (application.job.company.userId !== req.user!.userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền mở khóa hồ sơ này' });
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        contactUnlocked: true,
        unlockedAt: new Date(),
        status: 'ACCEPTED',
      },
      include: {
        workerProfile: {
          include: {
            user: { select: { phone: true, email: true } },
          },
        },
      },
    });

    return res.json({
      success: true,
      message: 'Mở khóa thông tin liên hệ thành công!',
      data: {
        workerName: updated.workerProfile.fullName,
        phone: updated.workerProfile.user.phone,
        email: updated.workerProfile.user.email,
        exactAddress: `${updated.workerProfile.district}, ${updated.workerProfile.province}`,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi mở khóa thông tin', error: error.message });
  }
}
