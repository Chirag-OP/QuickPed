import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/network/dio_client.dart';
import '../data/auth_repository.dart';
enum AuthState { unauthenticated, loading, otpVerifiedNeedsProfile, authenticated }
class AuthNotifier extends Notifier<AuthState> {
  StorageService get _storageService => ref.read(storageServiceProvider);
  @override
  AuthState build() {
    _init();
    return AuthState.loading;
  }
  Future<void> _init() async {
    await Future.microtask(() {});
    final phone = _storageService.getPhone();
        if (phone != null && phone.isNotEmpty) {
      if (_storageService.isProfileComplete()) {
        state = AuthState.authenticated;
      } else {
        state = AuthState.otpVerifiedNeedsProfile;
      }
    } else {
      state = AuthState.unauthenticated;
    }
  }
  Future<void> loginWithPhone(String phone) async {
    state = AuthState.loading;
    try {
      await Future.delayed(const Duration(seconds: 1));
      state = AuthState.unauthenticated; 
    } catch (e) {
      state = AuthState.unauthenticated;
      rethrow;
    }
  }
  Future<void> verifyPhoneOtp(String phone, String otp) async {
    state = AuthState.loading;
    try {
      await Future.delayed(const Duration(seconds: 1));
      if (otp == "1234") {
        await _storageService.savePhone(phone);
        if (_storageService.isProfileComplete()) {
          state = AuthState.authenticated;
        } else {
          state = AuthState.otpVerifiedNeedsProfile;
        }
      } else {
        state = AuthState.unauthenticated;
        throw Exception("Incorrect OTP. Please try again.");
      }
    } catch (e) {
      state = AuthState.unauthenticated;
      rethrow;
    }
  }
  Future<void> completeProfile(String name, String email, String institution) async {
    state = AuthState.loading;
    try {
      await Future.delayed(const Duration(seconds: 1));
      await _storageService.saveUserProfile(
        name: name,
        email: email,
        institution: institution,
      );
      state = AuthState.authenticated;
    } catch (e) {
      state = AuthState.otpVerifiedNeedsProfile;
      rethrow;
    }
  }
  void forceLogout() async {
    await _storageService.deleteToken();
    state = AuthState.unauthenticated;
  }
}
final storageServiceProvider = Provider<StorageService>((ref) {
  throw UnimplementedError('Initialize in main.dart');
});
final dioClientProvider = Provider<DioClient>((ref) {
  throw UnimplementedError('Initialize in main.dart');
});
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return AuthRepository(dioClient.dio);
});
final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
