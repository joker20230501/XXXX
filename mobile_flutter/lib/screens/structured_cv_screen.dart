import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../services/api_service.dart';

class StructuredCvScreen extends StatefulWidget {
  final ApiService apiService;
  const StructuredCvScreen({Key? key, required this.apiService}) : super(key: key);

  @override
  State<StructuredCvScreen> createState() => _StructuredCvScreenState();
}

class _StructuredCvScreenState extends State<StructuredCvScreen> {
  final _nameController = TextEditingController();
  final _bioController = TextEditingController();
  
  RangeValues _salaryRange = const RangeValues(8000000, 12000000);
  final List<String> _selectedSkills = [];
  String _selectedProvince = 'Bình Dương';
  String _selectedDistrict = 'TP. Thuận An';
  bool _isLooking = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hồ Sơ Năng Lực Nhanh (CV)'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Basic Information
            const Text('1. Thông tin cá nhân', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Họ và tên của bạn',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
            ),
            const SizedBox(height: 20),

            // Expected Salary Range Slider (Mandatory)
            const Text('2. Mức lương kỳ vọng (VNĐ/tháng)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${(_salaryRange.start / 1000000).toStringAsFixed(1)} triệu',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                Text(
                  '${(_salaryRange.end / 1000000).toStringAsFixed(1)} triệu',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ],
            ),
            RangeSlider(
              values: _salaryRange,
              min: 5000000,
              max: 30000000,
              divisions: 25,
              activeColor: AppColors.primary,
              onChanged: (values) => setState(() => _salaryRange = values),
            ),
            const SizedBox(height: 20),

            // Skills Selection (One-tap selection)
            const Text('3. Kỹ năng của bạn (Chạm để chọn)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: AppConstants.popularSkills.map((skill) {
                final isSelected = _selectedSkills.contains(skill);
                return FilterChip(
                  label: Text(skill),
                  selected: isSelected,
                  selectedColor: AppColors.primary.withOpacity(0.2),
                  checkmarkColor: AppColors.primary,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedSkills.add(skill);
                      } else {
                        _selectedSkills.remove(skill);
                      }
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 20),

            // Location & Privacy Notice
            const Text('4. Khu vực mong muốn làm việc', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _selectedProvince,
              decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Tỉnh / Thành phố'),
              items: ['TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Bắc Ninh', 'Hà Nội']
                  .map((p) => DropdownMenuItem(value: p, child: Text(p)))
                  .toList(),
              onChanged: (val) => setState(() => _selectedProvince = val!),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: const Row(
                children: [
                  Icon(Icons.shield_outlined, color: Colors.blue),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Vị trí của bạn được bảo vệ quyền riêng tư: Nhà tuyển dụng chỉ thấy bán kính gần đúng và không xem được số điện thoại nếu bạn chưa đồng ý.',
                      style: TextStyle(fontSize: 12, color: Colors.blueGrey),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đã lưu hồ sơ năng lực thành công!')),
                  );
                },
                child: const Text('Lưu hồ sơ & Bật tìm việc', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
