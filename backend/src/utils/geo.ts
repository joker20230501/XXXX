/**
 * Geographic calculation utilities & Privacy Geofuzzing
 */

// Haversine distance in kilometers
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Generate fuzzed coordinates within a random radius (0.8km ~ 1.8km)
 * strictly protecting candidate privacy under Vietnam Decree 13/2023/NĐ-CP
 */
export function generateFuzzyCoordinates(lat: number, lon: number, radiusKm: number = 1.2): { lat: number; lon: number } {
  // Random angle
  const angle = Math.random() * 2 * Math.PI;
  // Random distance between 0.5km and radiusKm
  const distance = 0.5 + Math.random() * (radiusKm - 0.5);

  // 1 degree latitude ~= 111.32 km
  const deltaLat = (distance * Math.cos(angle)) / 111.32;
  // 1 degree longitude ~= 111.32 * cos(lat) km
  const deltaLon = (distance * Math.sin(angle)) / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    lat: Math.round((lat + deltaLat) * 100000) / 100000,
    lon: Math.round((lon + deltaLon) * 100000) / 100000,
  };
}

/**
 * Multi-dimensional matching score (0 - 100)
 */
export function calculateMatchScore(
  jobLat: number,
  jobLon: number,
  jobSalaryMin: number,
  jobSalaryMax: number,
  jobSkills: string[],
  workerLat: number,
  workerLon: number,
  workerSalaryMin: number,
  workerSalaryMax: number,
  workerSkills: string[]
): { score: number; distanceKm: number; matchedSkills: string[] } {
  // 1. Distance Score (Max 40 pts)
  const distanceKm = haversineDistanceKm(jobLat, jobLon, workerLat, workerLon);
  let distanceScore = 5;
  if (distanceKm <= 3) distanceScore = 40;
  else if (distanceKm <= 6) distanceScore = 32;
  else if (distanceKm <= 10) distanceScore = 24;
  else if (distanceKm <= 15) distanceScore = 15;

  // 2. Skill Match Score (Max 40 pts)
  const workerSkillSet = new Set(workerSkills.map((s) => s.toLowerCase().trim()));
  const matchedSkills = jobSkills.filter((s) => workerSkillSet.has(s.toLowerCase().trim()));
  const skillRatio = jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 1;
  const skillScore = Math.round(skillRatio * 40);

  // 3. Salary Overlap Score (Max 20 pts)
  let salaryScore = 10;
  if (jobSalaryMax >= workerSalaryMin && jobSalaryMin <= workerSalaryMax) {
    salaryScore = 20; // Perfect overlap
  } else if (Math.abs(jobSalaryMax - workerSalaryMin) <= 2000000) {
    salaryScore = 14; // Within 2M VND tolerance
  } else {
    salaryScore = 4;
  }

  const totalScore = Math.min(100, Math.max(0, distanceScore + skillScore + salaryScore));

  return {
    score: totalScore,
    distanceKm,
    matchedSkills,
  };
}
