import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../config/constants.dart';
import '../models/job.dart';
import '../services/api_service.dart';

class MapHomeScreen extends StatefulWidget {
  final ApiService apiService;

  const MapHomeScreen({Key? key, required this.apiService}) : super(key: key);

  @override
  State<MapHomeScreen> createState() => _MapHomeScreenState();
}

class _MapHomeScreenState extends State<MapHomeScreen> {
  GoogleMapController? _mapController;
  
  // Default center: Ho Chi Minh City / Binh Duong Border Area
  final LatLng _initialPosition = const LatLng(10.8231, 106.6297);
  double _searchRadiusKm = 10.0;
  String _selectedSkillFilter = '';
  
  List<Job> _jobs = [];
  Job? _selectedJob;
  bool _isLoading = false;
  Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  Future<void> _loadJobs() async {
    setState(() => _isLoading = true);
    try {
      final jobs = await widget.apiService.fetchJobsOnMap(
        centerLat: _initialPosition.latitude,
        centerLng: _initialPosition.longitude,
        radiusKm: _searchRadiusKm,
        skill: _selectedSkillFilter.isNotEmpty ? _selectedSkillFilter : null,
      );

      setState(() {
        _jobs = jobs;
        _markers = jobs.map((job) {
          return Marker(
            markerId: MarkerId(job.id),
            position: LatLng(job.latitude, job.longitude),
            infoWindow: InfoWindow(
              title: job.title,
              snippet: '${job.formattedSalary} • ${job.companyName}',
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
            onTap: () {
              setState(() => _selectedJob = job);
            },
          );
        }).toSet();
      });
    } catch (e) {
      debugPrint('Error loading jobs: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // 1. Google Map View
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: _initialPosition,
              zoom: 12.5,
            ),
            markers: _markers,
            onMapCreated: (controller) => _mapController = controller,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            onTap: (_) => setState(() => _selectedJob = null),
          ),

          // 2. Top Filter Bar (Search + Radius + Quick Skill Tags)
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Search Box
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Row(
                      children: [
                        const Icon(Icons.search, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            decoration: const InputDecoration(
                              hintText: 'Tìm theo kỹ năng, vị trí (VD: May mặc, Lái xe)...',
                              border: InputBorder.none,
                            ),
                            onSubmitted: (val) {
                              _selectedSkillFilter = val;
                              _loadJobs();
                            },
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.tune, color: AppColors.textSub),
                          onPressed: _showRadiusDialog,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Quick Skill Pills
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterPill('Tất cả', _selectedSkillFilter.isEmpty, () {
                          setState(() => _selectedSkillFilter = '');
                          _loadJobs();
                        }),
                        ...AppConstants.popularSkills.take(6).map((skill) {
                          final isSelected = _selectedSkillFilter == skill;
                          return _buildFilterPill(skill, isSelected, () {
                            setState(() => _selectedSkillFilter = isSelected ? '' : skill);
                            _loadJobs();
                          });
                        }).toList(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 3. Selected Job Bottom Card
          if (_selectedJob != null)
            Positioned(
              left: 16,
              right: 16,
              bottom: 24,
              child: _buildJobCard(_selectedJob!),
            ),
        ],
      ),
    );
  }

  Widget _buildFilterPill(String label, bool isSelected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : AppColors.textMain,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildJobCard(Job job) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.12),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  job.title,
                  style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textMain),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  job.formattedSalary,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '🏢 ${job.companyName} • ${job.district}, ${job.province}',
            style: const TextStyle(color: AppColors.textSub, fontSize: 13),
          ),
          const SizedBox(height: 10),

          // Benefits Wrap
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: job.benefits.take(3).map((b) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: Colors.amber.shade200),
                ),
                child: Text('✓ $b', style: TextStyle(color: Colors.amber.shade900, fontSize: 11)),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),

          // Actions (Apply & Navigate)
          Row(
            children: [
              if (job.distanceKm != null)
                Text(
                  'Cách bạn ~${job.distanceKm!.toStringAsFixed(1)} km',
                  style: const TextStyle(color: AppColors.textSub, fontSize: 12, fontWeight: FontWeight.w500),
                ),
              const Spacer(),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                ),
                onPressed: () async {
                  final success = await widget.apiService.applyToJob(job.id);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(success ? 'Ứng tuyển thành công!' : 'Lỗi khi ứng tuyển'),
                        backgroundColor: success ? AppColors.primary : AppColors.danger,
                      ),
                    );
                  }
                },
                child: const Text('Ứng tuyển ngay'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showRadiusDialog() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Khoảng cách tìm kiếm (Bán kính)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Slider(
                value: _searchRadiusKm,
                min: 2,
                max: 30,
                divisions: 14,
                activeColor: AppColors.primary,
                label: '${_searchRadiusKm.toInt()} km',
                onChanged: (val) {
                  setModalState(() => _searchRadiusKm = val);
                  setState(() => _searchRadiusKm = val);
                },
              ),
              Center(
                child: Text('Trong phạm vi ${_searchRadiusKm.toInt()} km quanh bạn', style: const TextStyle(color: AppColors.textSub)),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                  onPressed: () {
                    Navigator.pop(ctx);
                    _loadJobs();
                  },
                  child: const Text('Áp dụng'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
