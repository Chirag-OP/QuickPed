import 'package:dio/dio.dart';

class AuthRepository {
  final Dio _dio;

  AuthRepository(this._dio);

  // POST /api/v1/auth/otp/send
  Future<void> sendPhoneOtp(String phoneNumber) async {
    await _dio.post('/auth/otp/send', data: {'phoneNumber': phoneNumber});
  }

  // POST /api/v1/auth/otp/verify
  Future<String> verifyPhoneOtp(String phoneNumber, String otpCode) async {
    final res = await _dio.post('/auth/otp/verify', data: {
      'phoneNumber': phoneNumber,
      'otpCode': otpCode,
    });
    return res.data['token'];
  }

  // GET /api/v1/users/me
  Future<void> getMe() async {
    await _dio.get('/users/me');
  }

  // PUT /api/v1/users/me/profile
  Future<void> updateProfile(String name, String campusId) async {
    await _dio.put('/users/me/profile', data: {
      'name': name,
      'campusId': campusId,
    });
  }

  // POST /api/v1/auth/email-otp/send
  Future<void> sendEmailOtp(String email) async {
    await _dio.post('/auth/email-otp/send', data: {'email': email});
  }

  // POST /api/v1/auth/email-otp/verify
  Future<String> verifyEmailOtp(String email, String otpCode) async {
    final res = await _dio.post('/auth/email-otp/verify', data: {
      'email': email,
      'otpCode': otpCode,
    });
    return res.data['token'];
  }
}
