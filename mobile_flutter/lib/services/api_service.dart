import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../models/job.dart';

class ApiService {
  final String baseUrl = AppConstants.apiBaseUrl;
  String? authToken;

  void setToken(String token) {
    authToken = token;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (authToken != null) 'Authorization': 'Bearer $authToken',
      };

  Future<List<Job>> fetchJobsOnMap({
    required double centerLat,
    required double centerLng,
    double radiusKm = 10,
    String? skill,
  }) async {
    final queryParams = {
      'centerLat': centerLat.toString(),
      'centerLng': centerLng.toString(),
      'radiusKm': radiusKm.toString(),
      if (skill != null && skill.isNotEmpty) 'skill': skill,
    };

    final uri = Uri.parse('$baseUrl/jobs/map').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: _headers);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List list = data['data'];
      return list.map((item) => Job.fromJson(item)).toList();
    } else {
      throw Exception('Không thể tải dữ liệu việc làm');
    }
  }

  Future<List<Job>> fetchSmartRecommendations() async {
    final uri = Uri.parse('$baseUrl/matching/recommendations');
    final response = await http.get(uri, headers: _headers);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List list = data['data'];
      return list.map((item) => Job.fromJson(item)).toList();
    } else {
      throw Exception('Lỗi tải danh sách gợi ý phù hợp');
    }
  }

  Future<bool> applyToJob(String jobId, {String? note}) async {
    final uri = Uri.parse('$baseUrl/matching/apply');
    final response = await http.post(
      uri,
      headers: _headers,
      body: json.encode({'jobId': jobId, 'note': note}),
    );
    return response.statusCode == 201;
  }
}
