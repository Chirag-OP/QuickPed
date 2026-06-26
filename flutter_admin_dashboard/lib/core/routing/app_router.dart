import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/presentation/auth_screens.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      if (authState == AuthState.loading) return null;

      final isUnauthenticated = authState == AuthState.unauthenticated;
      final isNeedsProfile = authState == AuthState.otpVerifiedNeedsProfile;
      final isAuth = authState == AuthState.authenticated;

      final isGoingToLogin = state.matchedLocation == '/login';
      final isGoingToVerifyOtp = state.matchedLocation == '/verify-otp';
      final isGoingToProfileSetup = state.matchedLocation == '/profile-setup';

      if (isUnauthenticated) {
        if (!isGoingToLogin && !isGoingToVerifyOtp) {
          return '/login';
        }
      }

      if (isNeedsProfile) {
        if (!isGoingToProfileSetup) {
          return '/profile-setup';
        }
      }

      if (isAuth) {
        if (isGoingToLogin || isGoingToVerifyOtp || isGoingToProfileSetup) {
          return '/';
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const MainDashboardScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const PhoneLoginScreen(),
      ),
      GoRoute(
        path: '/verify-otp',
        builder: (context, state) {
          final phone = state.extra as String? ?? '';
          return VerifyOtpScreen(phone: phone);
        },
      ),
      GoRoute(
        path: '/profile-setup',
        builder: (context, state) => const CampusProfileScreen(),
      ),
      GoRoute(
        path: '/my-profile',
        builder: (context, state) => const UserProfileScreen(),
      ),
    ],
  );
});
