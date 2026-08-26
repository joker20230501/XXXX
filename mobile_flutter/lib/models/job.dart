class Job {
  final String id;
  final String title;
  final String companyName;
  final String? companyLogo;
  final double salaryMin;
  final double salaryMax;
  final String salaryType;
  final bool isGross;
  final List<String> requiredSkills;
  final List<String> benefits;
  final String description;
  final String workAddress;
  final String province;
  final String district;
  final double latitude;
  final double longitude;
  final double? distanceKm;
  final int? matchScore;

  Job({
    required this.id,
    required this.title,
    required this.companyName,
    this.companyLogo,
    required this.salaryMin,
    required this.salaryMax,
    required this.salaryType,
    required this.isGross,
    required this.requiredSkills,
    required this.benefits,
    required this.description,
    required this.workAddress,
    required this.province,
    required this.district,
    required this.latitude,
    required this.longitude,
    this.distanceKm,
    this.matchScore,
  });

  String get formattedSalary {
    final minM = (salaryMin / 1000000).toStringAsFixed(1).replaceAll('.0', '');
    final maxM = (salaryMax / 1000000).toStringAsFixed(1).replaceAll('.0', '');
    final unit = salaryType == 'MONTHLY' ? 'tr/tháng' : salaryType == 'HOURLY' ? 'k/giờ' : 'k/ngày';
    return '$minM - $maxM $unit';
  }

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'],
      title: json['title'],
      companyName: json['company']?['companyName'] ?? 'Doanh nghiệp',
      companyLogo: json['company']?['logoUrl'],
      salaryMin: double.tryParse(json['salaryMin'].toString()) ?? 0,
      salaryMax: double.tryParse(json['salaryMax'].toString()) ?? 0,
      salaryType: json['salaryType'] ?? 'MONTHLY',
      isGross: json['isGross'] ?? false,
      requiredSkills: List<String>.from(json['requiredSkills'] ?? []),
      benefits: List<String>.from(json['benefits'] ?? []),
      description: json['description'] ?? '',
      workAddress: json['workAddress'] ?? '',
      province: json['province'] ?? '',
      district: json['district'] ?? '',
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      distanceKm: json['distanceKm'] != null ? (json['distanceKm'] as num).toDouble() : null,
      matchScore: json['matchScore'],
    );
  }
}
