export interface CityZone {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

export const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Aerospace Engineering',
  'Biomedical Engineering',
  'Architecture',
  'Business Administration',
  'Environmental Science',
  'Mathematics',
  'Physics',
] as const;

export type Department = (typeof departments)[number];

export const attendanceCities: CityZone[] = [
  { name: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { name: 'New Delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
  { name: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  { name: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  { name: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
  { name: 'Surat', state: 'Maharashtra', latitude: 21.1702, longitude: 72.8311 },
  { name: 'Kanpur', state: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319 },
  { name: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
  { name: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  { name: 'Thane', state: 'Maharashtra', latitude: 19.2183, longitude: 72.9781 },
  { name: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', latitude: 17.6868, longitude: 83.2185 },
  { name: 'Pimpri-Chinchwad', state: 'Maharashtra', latitude: 18.6270, longitude: 73.8000 },
  { name: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376 },
  { name: 'Vadodara', state: 'Gujarat', latitude: 22.3072, longitude: 73.1812 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.6692, longitude: 77.4538 },
  { name: 'Ludhiana', state: 'Punjab', latitude: 30.9010, longitude: 75.8573 },
  { name: 'Agra', state: 'Uttar Pradesh', latitude: 27.1767, longitude: 78.0081 },
  { name: 'Nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898 },
  { name: 'Faridabad', state: 'Haryana', latitude: 28.4089, longitude: 77.3178 },
  { name: 'Meerut', state: 'Uttar Pradesh', latitude: 28.9845, longitude: 77.7064 },
  { name: 'Rajkot', state: 'Gujarat', latitude: 22.3039, longitude: 70.8022 },
  { name: 'Kalyan-Dombivali', state: 'Maharashtra', latitude: 19.2403, longitude: 73.1306 },
  { name: 'Vasai-Virar', state: 'Maharashtra', latitude: 19.3910, longitude: 72.8397 },
  { name: 'Varanasi', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },
  { name: 'Srinagar', state: 'Jammu and Kashmir', latitude: 34.0837, longitude: 74.7973 },
  { name: 'Aurangabad', state: 'Maharashtra', latitude: 19.8762, longitude: 75.3433 },
  { name: 'Dhanbad', state: 'Jharkhand', latitude: 23.7957, longitude: 86.4304 },
  { name: 'Amritsar', state: 'Punjab', latitude: 31.6339, longitude: 74.8723 },
  { name: 'Navi Mumbai', state: 'Maharashtra', latitude: 19.0330, longitude: 73.0297 },
  { name: 'Prayagraj', state: 'Uttar Pradesh', latitude: 25.4358, longitude: 81.8463 },
  { name: 'Howrah', state: 'West Bengal', latitude: 22.5958, longitude: 88.2636 },
  { name: 'Gwalior', state: 'Madhya Pradesh', latitude: 26.2183, longitude: 78.1828 },
  { name: 'Jabalpur', state: 'Madhya Pradesh', latitude: 23.1815, longitude: 79.9864 },
  { name: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },
  { name: 'Vijayawada', state: 'Andhra Pradesh', latitude: 16.5062, longitude: 80.6480 },
  { name: 'Jodhpur', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243 },
  { name: 'Madurai', state: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
  { name: 'Raipur', state: 'Chhattisgarh', latitude: 21.2514, longitude: 81.6296 },
  { name: 'Kota', state: 'Rajasthan', latitude: 25.2138, longitude: 75.8648 },
  { name: 'Guwahati', state: 'Assam', latitude: 26.1445, longitude: 91.7362 },
  { name: 'Chandigarh', state: 'Chandigarh', latitude: 30.7333, longitude: 76.7794 },
  { name: 'Solapur', state: 'Maharashtra', latitude: 17.6599, longitude: 75.9064 },
  { name: 'Hubli-Dharwad', state: 'Karnataka', latitude: 15.3647, longitude: 75.1230 },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', latitude: 10.7905, longitude: 78.7047 },
  { name: 'Bareilly', state: 'Uttar Pradesh', latitude: 28.3670, longitude: 79.4304 },
  { name: 'Aligarh', state: 'Uttar Pradesh', latitude: 27.8922, longitude: 78.0880 },
  { name: 'Tiruppur', state: 'Tamil Nadu', latitude: 11.1085, longitude: 77.3411 },
  { name: 'Moradabad', state: 'Uttar Pradesh', latitude: 28.8375, longitude: 78.7734 },
  { name: 'Mysore', state: 'Karnataka', latitude: 12.2958, longitude: 76.6394 },
  { name: 'Gurugram', state: 'Haryana', latitude: 28.4595, longitude: 77.0266 },
  { name: 'Alwar', state: 'Rajasthan', latitude: 27.5667, longitude: 76.6167 },
  { name: 'Jalandhar', state: 'Punjab', latitude: 31.3260, longitude: 75.5762 },
  { name: 'Bhubaneswar', state: 'Odisha', latitude: 20.2961, longitude: 85.8245 },
  { name: 'Salem', state: 'Tamil Nadu', latitude: 11.6643, longitude: 78.1460 },
  { name: 'Mira-Bhayandar', state: 'Maharashtra', latitude: 19.2857, longitude: 72.8541 },
  { name: 'Warangal', state: 'Telangana', latitude: 18.0004, longitude: 79.5788 },
  { name: 'Thiruvananthapuram', state: 'Kerala', latitude: 8.5241, longitude: 76.9366 },
  { name: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365 },
  { name: 'Bhiwandi', state: 'Maharashtra', latitude: 19.2826, longitude: 73.0146 },
  { name: 'Saharanpur', state: 'Uttar Pradesh', latitude: 29.9678, longitude: 77.5510 },
  { name: 'Gorakhpur', state: 'Uttar Pradesh', latitude: 26.7606, longitude: 83.3732 },
  { name: 'Bikaner', state: 'Rajasthan', latitude: 28.0229, longitude: 73.3119 },
  { name: 'Amravati', state: 'Maharashtra', latitude: 20.9374, longitude: 77.7797 },
  { name: 'Noida', state: 'Uttar Pradesh', latitude: 28.5355, longitude: 77.3910 },
  { name: 'Jamshedpur', state: 'Jharkhand', latitude: 22.8046, longitude: 86.2029 },
  { name: 'Kurnool', state: 'Andhra Pradesh', latitude: 15.8281, longitude: 78.0373 },
  { name: 'Ambattur', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.1650 },
  { name: 'Davanagere', state: 'Karnataka', latitude: 14.4646, longitude: 75.9218 },
  { name: 'Nanded', state: 'Maharashtra', latitude: 19.1542, longitude: 77.3210 },
  { name: 'Ajmer', state: 'Rajasthan', latitude: 26.4499, longitude: 74.6399 },
  { name: 'Kalaburagi', state: 'Karnataka', latitude: 17.3297, longitude: 76.8343 },
  { name: 'Kolhapur', state: 'Maharashtra', latitude: 16.7050, longitude: 74.2433 },
  { name: 'Jammu', state: 'Jammu and Kashmir', latitude: 32.7266, longitude: 74.8570 },
  { name: 'Sangli', state: 'Maharashtra', latitude: 16.8531, longitude: 74.5676 },
  { name: 'Mangalore', state: 'Karnataka', latitude: 12.9141, longitude: 74.8560 },
  { name: 'Udaipur', state: 'Rajasthan', latitude: 24.5854, longitude: 73.7125 },
  { name: 'Bellary', state: 'Karnataka', latitude: 15.1394, longitude: 76.9214 },
  { name: 'Tirunelveli', state: 'Tamil Nadu', latitude: 8.7139, longitude: 77.7560 },
  { name: 'Malegaon', state: 'Maharashtra', latitude: 20.5550, longitude: 74.5370 },
  { name: 'Bhagalpur', state: 'Bihar', latitude: 25.2441, longitude: 86.9846 },
  { name: 'Agartala', state: 'Tripura', latitude: 23.8315, longitude: 91.2868 },
  { name: 'Dehradun', state: 'Uttarakhand', latitude: 30.3165, longitude: 78.0322 },
  { name: 'Ranchi', state: 'Jharkhand', latitude: 23.3441, longitude: 85.3096 },
  { name: 'Shimla', state: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734 },
  { name: 'Panaji', state: 'Goa', latitude: 15.4909, longitude: 73.8278 },
  { name: 'Kochi', state: 'Kerala', latitude: 9.9312, longitude: 76.2673 },
  { name: 'Durgapur', state: 'West Bengal', latitude: 23.5204, longitude: 87.3119 },
  { name: 'Thanjavur', state: 'Tamil Nadu', latitude: 10.7870, longitude: 79.1378 },
  { name: 'Muzaffarpur', state: 'Bihar', latitude: 26.1209, longitude: 85.3647 },
  { name: 'Nellore', state: 'Andhra Pradesh', latitude: 14.4426, longitude: 79.9865 },
  { name: 'Tirupati', state: 'Andhra Pradesh', latitude: 13.6288, longitude: 79.4192 },
  { name: 'Shivamogga', state: 'Karnataka', latitude: 13.9299, longitude: 75.5681 },
  { name: 'Korba', state: 'Chhattisgarh', latitude: 22.3450, longitude: 82.6900 },
  { name: 'Ujjain', state: 'Madhya Pradesh', latitude: 23.1793, longitude: 75.7849 },
];

const NATIONAL_HOLIDAY_KEYS = new Set([
  '01-26',
  '08-15',
  '10-02',
]);

export const isNationalHoliday = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return NATIONAL_HOLIDAY_KEYS.has(`${month}-${day}`);
};

export const isAttendanceDayAllowed = (date: Date) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 6 && !isNationalHoliday(date);
};

export const MAX_STUDENTS_PER_DEPARTMENT = 1000;
export const MAX_ADMINS_PER_DEPARTMENT = 5;
export const ATTENDANCE_CITY_RADIUS_METERS = 10000;
