import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient();

export async function register(req: Request, res: Response) {
  try {
    const { phone, password, role, email, companyName, industry, address, province, district, latitude, longitude } = req.body;

    if (!phone || !password || !role) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số điện thoại, mật khẩu và vai trò' });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được đăng ký' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        phone,
        email: email || null,
        passwordHash,
        role,
        ...(role === 'EMPLOYER' && companyName
          ? {
              company: {
                create: {
                  companyName,
                  industry: industry || 'Khác',
                  address: address || '',
                  province: province || 'TP. Hồ Chí Minh',
                  district: district || '',
                  latitude: latitude || 10.7769,
                  longitude: longitude || 106.7009,
                },
              },
            }
          : {}),
      },
      include: {
        company: true,
        workerProfile: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, phone: user.phone },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          company: user.company,
          workerProfile: user.workerProfile,
        },
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        company: true,
        workerProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Số điện thoại hoặc mật khẩu không chính xác' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Số điện thoại hoặc mật khẩu không chính xác' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, phone: user.phone },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          company: user.company,
          workerProfile: user.workerProfile,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        company: true,
        workerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        company: user.company,
        workerProfile: user.workerProfile,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
}
