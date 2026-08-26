import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../services/api_service.dart';

class PostJobScreen extends StatefulWidget {
  final ApiService apiService;
  const PostJobScreen({Key? key, required this.apiService}) : super(key: key);

  @override
  State<PostJobScreen> createState() => _PostJobScreenState();
}

class _PostJobScreenState extends State<PostJobScreen> {
  final _titleController = TextEditingController();
  final _minSalaryController = TextEditingController(text: '8000000');
  final _maxSalaryController = TextEditingController(text: '12000000');
  final _addressController = TextEditingController();
  final _descController = TextEditingController();

  final List<String> _selectedSkills = [];
  final List<String> _selectedBenefits = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đăng Tin Tuyển Dụng Mới'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('1. Tiêu đề vị trí', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(
                hintText: 'Ví dụ: Công nhân may công nghiệp / Tài xế xe nâng',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // Mandatory Transparent Salary
            const Text('2. Mức lương minh bạch (Bắt buộc)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _minSalaryController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Tối thiểu (VNĐ)', border: OutlineInputBorder()),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Text('—', style: TextStyle(fontSize: 20)),
                ),
                Expanded(
                  child: TextField(
                    controller: _maxSalaryController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Tối đa (VNĐ)', border: OutlineInputBorder()),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Required Skills Tagging
            const Text('3. Kỹ năng yêu cầu', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: AppConstants.popularSkills.map((s) {
                final isSelected = _selectedSkills.contains(s);
                return FilterChip(
                  label: Text(s),
                  selected: isSelected,
                  selectedColor: AppColors.primary.withOpacity(0.2),
                  onSelected: (selected) {
                    setState(() {
                      if (selected) _selectedSkills.add(s);
                      else _selectedSkills.remove(s);
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Welfare & Benefits Checklist
            const Text('4. Chế độ đãi ngộ & Phúc lợi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: AppConstants.commonBenefits.map((b) {
                final isSelected = _selectedBenefits.contains(b);
                return FilterChip(
                  label: Text(b),
                  selected: isSelected,
                  selectedColor: Colors.amber.shade100,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) _selectedBenefits.add(b);
                      else _selectedBenefits.remove(b);
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Work Location
            const Text('5. Địa chỉ làm việc (Để định vị trên bản đồ)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _addressController,
              decoration: const InputDecoration(
                hintText: 'Ví dụ: KCN VSIP 1, Thuận An, Bình Dương',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.location_on, color: AppColors.primary),
              ),
            ),
            const SizedBox(height: 24),

            // Post Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đăng tin tuyển dụng lên bản đồ thành công!')),
                  );
                },
                child: const Text('Đăng tin lên bản đồ', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
