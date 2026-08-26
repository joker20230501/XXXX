import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF008848); // Vietnam Green (familiar in VN)
  static const Color secondary = Color(0xFFFFB800); // Warm Accent Yellow
  static const Color background = Color(0xFFF7F8FA);
  static const Color surface = Colors.white;
  static const Color textMain = Color(0xFF1E293B);
  static const Color textSub = Color(0xFF64748B);
  static const Color border = Color(0xFFE2E8F0);
  static const Color danger = Color(0xFFEF4444);
}

class AppConstants {
  static const String apiBaseUrl = 'http://localhost:3000/api/v1';

  // Popular blue-collar & service skill tags in Vietnam
  static const List<String> popularSkills = [
    'Lái xe nâng',
    'May công nghiệp',
    'Thủ kho / Kiểm kê',
    'Pha chế / Bartender',
    'Thu ngân POS',
    'Hàn xì / Cơ khí',
    'Lắp ráp linh kiện',
    'Tiếng Trung giao tiếp',
    'Tiếng Anh cơ bản',
    'Đóng gói sản phẩm',
    'Phục vụ bàn',
    'Bảo vệ an ninh',
  ];

  // Common mandatory welfare/benefit tags in Vietnam
  static const List<String> commonBenefits = [
    'Bao ăn trưa / giữa ca',
    'Có ký túc xá / phòng trọ',
    'Thưởng chuyên cần',
    'Đầy đủ BHXH / BHYT',
    'Tháng lương 13',
    'Phụ cấp xăng xe',
    'Xe đưa rước nhân viên',
  ];
}
