import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Strict schema for Job Postings enforcing transparent salary & skills
export const createJobSchema = z.object({
  title: z.string().min(3, 'Tiêu đề công việc ít nhất 3 ký tự'),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'SEASONAL', 'SHIFT_WORK']).default('FULL_TIME'),
  
  // Mandatory transparent salary validation
  salaryMin: z.number().positive('Mức lương tối thiểu phải lớn hơn 0'),
  salaryMax: z.number().positive('Mức lương tối đa phải lớn hơn 0'),
  salaryType: z.enum(['MONTHLY', 'DAILY', 'HOURLY']).default('MONTHLY'),
  isGross: z.boolean().default(false),
  
  // Mandatory skills & benefits
  requiredSkills: z.array(z.string()).min(1, 'Cần ít nhất 1 kỹ năng yêu cầu cụ thể'),
  preferredSkills: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).min(1, 'Vui lòng cung cấp ít nhất 1 chế độ đãi ngộ (Ví dụ: Bao ăn, BHXH)'),
  description: z.string().min(10, 'Mô tả công việc tối thiểu 10 ký tự'),
  
  // Exact coordinates for map
  workAddress: z.string().min(5, 'Địa chỉ làm việc cụ thể'),
  province: z.string().min(2, 'Tỉnh / Thành phố'),
  district: z.string().min(2, 'Quận / Huyện / Thị xã'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
}).refine((data) => data.salaryMax >= data.salaryMin, {
  message: 'Mức lương tối đa (salaryMax) phải lớn hơn hoặc bằng mức lương tối thiểu (salaryMin)',
  path: ['salaryMax'],
});

// Strict schema for Worker Profile
export const workerProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên ít nhất 2 ký tự'),
  expectedSalaryMin: z.number().positive('Mức lương mong muốn tối thiểu phải lớn hơn 0'),
  expectedSalaryMax: z.number().positive('Mức lương mong muốn tối đa phải lớn hơn 0'),
  salaryType: z.enum(['MONTHLY', 'DAILY', 'HOURLY']).default('MONTHLY'),
  experienceYears: z.number().min(0).default(0),
  bio: z.string().optional(),
  
  skills: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 kỹ năng cụ thể của bạn'),
  certificates: z.array(z.string()).optional().default([]),
  
  province: z.string().min(2, 'Tỉnh / Thành phố'),
  district: z.string().min(2, 'Quận / Huyện / Thị xã'),
  exactLatitude: z.number().min(-90).max(90),
  exactLongitude: z.number().min(-180).max(180),
}).refine((data) => data.expectedSalaryMax >= data.expectedSalaryMin, {
  message: 'Lương kỳ vọng tối đa phải lớn hơn hoặc bằng mức tối thiểu',
  path: ['expectedSalaryMax'],
});

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: result.error.format(),
      });
    }
    req.body = result.data;
    next();
  };
}
