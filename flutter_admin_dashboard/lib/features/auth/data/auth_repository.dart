import 'package:dio/dio.dart';
class AuthRepository {
  final Dio _dio;
  AuthRepository(this._dio);
  Future<void> sendPhoneOtp(String phoneNumber) async {
    await _dio.post('/auth/otp/send', data: {'phoneNumber': phoneNumber});
  }
  Future<String> verifyPhoneOtp(String phoneNumber, String otpCode) async {
    final res = await _dio.post('/auth/otp/verify', data: {
      'phoneNumber': phoneNumber,
      'otpCode': otpCode,
    });
    return res.data['token'];
  }
  Future<void> getMe() async {
    await _dio.get('/users/me');
  }
  Future<void> updateProfile(String name, String campusId) async {
    await _dio.put('/users/me/profile', data: {
      'name': name,
      'campusId': campusId,
    });
  }
  Future<void> sendEmailOtp(String email) async {
    await _dio.post('/auth/email-otp/send', data: {'email': email});
  }
  Future<String> verifyEmailOtp(String email, String otpCode) async {
    final res = await _dio.post('/auth/email-otp/verify', data: {
      'email': email,
      'otpCode': otpCode,
    });
    return res.data['token'];
  }
}
