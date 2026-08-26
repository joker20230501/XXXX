import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateFuzzyCoordinates } from '../src/utils/geo';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with Vietnam local data...');

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Create Employer 1: Logistics VSIP Bình Dương
  const employer1 = await prisma.user.upsert({
    where: { phone: '0901234567' },
    update: {},
    create: {
      phone: '0901234567',
      email: 'hr@vsiplogistics.vn',
      passwordHash,
      role: 'EMPLOYER',
      company: {
        create: {
          companyName: 'Công Ty TNHH Logistics & Kho Vận VSIP',
          taxCode: '3701234567',
          industry: 'Kho vận & Logistics',
          address: 'Đại lộ Hữu Nghị, KCN VSIP 1, TP. Thuận An',
          province: 'Bình Dương',
          district: 'TP. Thuận An',
          latitude: 10.9312,
          longitude: 106.6985,
          isVerified: true,
        },
      },
    },
    include: { company: true },
  });

  // 2. Create Employer 2: Chuỗi F&B Quận 1, HCMC
  const employer2 = await prisma.user.upsert({
    where: { phone: '0907654321' },
    update: {},
    create: {
      phone: '0907654321',
      email: 'tuyendung@saigoncoffee.vn',
      passwordHash,
      role: 'EMPLOYER',
      company: {
        create: {
          companyName: 'Chuỗi Cà Phê Saigon Heritage',
          taxCode: '0319876543',
          industry: 'F&B / Nhà hàng',
          address: '45 Lê Duẩn, Bến Nghé, Quận 1',
          province: 'TP. Hồ Chí Minh',
          district: 'Quận 1',
          latitude: 10.7825,
          longitude: 106.6992,
          isVerified: true,
        },
      },
    },
    include: { company: true },
  });

  // 3. Create Job Postings
  if (employer1.company) {
    await prisma.jobPosting.create({
      data: {
        companyId: employer1.company.id,
        title: 'Tài xế Lái Xe Nâng & Thủ Kho (KCN VSIP 1)',
        jobType: 'FULL_TIME',
        salaryMin: 10000000,
        salaryMax: 13500000,
        salaryType: 'MONTHLY',
        isGross: false,
        requiredSkills: ['Lái xe nâng', 'Quản lý kho hàng', 'Kiểm kê hàng hóa'],
        preferredSkills: ['Bằng lái xe nâng', 'Phần mềm ERP'],
        benefits: ['Bao cơm trưa + phụ cấp ca đêm', 'Ký túc xá miễn phí máy lạnh', 'Thưởng chuyên cần 800k/tháng', 'Đầy đủ BHXH/BHYT'],
        description: 'Vận hành xe nâng xếp dỡ pallet trong kho mát, kiểm kê hàng hóa xuất nhập khẩu, làm việc theo ca 8 tiếng.',
        workAddress: 'Đường số 6, KCN VSIP 1, TP. Thuận An, Bình Dương',
        province: 'Bình Dương',
        district: 'TP. Thuận An',
        latitude: 10.9315,
        longitude: 106.6980,
      },
    });
  }

  if (employer2.company) {
    await prisma.jobPosting.create({
      data: {
        companyId: employer2.company.id,
        title: 'Nhân viên Pha chế & Thu ngân (Ca xoay)',
        jobType: 'FULL_TIME',
        salaryMin: 7000000,
        salaryMax: 9000000,
        salaryType: 'MONTHLY',
        isGross: false,
        requiredSkills: ['Pha chế đồ uống', 'Thu ngân POS', 'Giao tiếp khách hàng'],
        preferredSkills: ['Tiếng Anh cơ bản', 'Kinh nghiệm 6 tháng'],
        benefits: ['Tip chia đều hàng tuần', 'Giảm giá 50% menu cho nhân viên', 'Phụ cấp gửi xe + cơm trưa', 'Thưởng doanh số tháng'],
        description: 'Thực hiện pha chế trà, cà phê theo công thức chuẩn; oder và tính tiền cho khách hàng, giữ vệ sinh quầy bar.',
        workAddress: '45 Lê Duẩn, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        latitude: 10.7825,
        longitude: 106.6992,
      },
    });
  }

  // 4. Create Worker Profile with Privacy Geofuzzing
  const exactLat = 10.928;
  const exactLon = 106.695;
  const fuzzy = generateFuzzyCoordinates(exactLat, exactLon);

  await prisma.user.upsert({
    where: { phone: '0988889999' },
    update: {},
    create: {
      phone: '0988889999',
      email: 'hung.nguyen92@gmail.com',
      passwordHash,
      role: 'WORKER',
      workerProfile: {
        create: {
          fullName: 'Nguyễn Văn Hùng',
          expectedSalaryMin: 10000000,
          expectedSalaryMax: 13000000,
          salaryType: 'MONTHLY',
          experienceYears: 3,
          bio: 'Kinh nghiệm 3 năm lái xe nâng và quản lý xuất nhập kho tại KCN Sóng Thần, chịu khó, làm được ca đêm.',
          exactLatitude: exactLat,
          exactLongitude: exactLon,
          fuzzyLatitude: fuzzy.lat,
          fuzzyLongitude: fuzzy.lon,
          province: 'Bình Dương',
          district: 'TP. Thuận An',
          skills: ['Lái xe nâng', 'Quản lý kho hàng', 'Sắp xếp hàng hóa', 'Tiếng Trung giao tiếp'],
          certificates: ['Chứng chỉ lái xe nâng an toàn', 'Bằng lái xe B2'],
          isLookingForJob: true,
        },
      },
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
