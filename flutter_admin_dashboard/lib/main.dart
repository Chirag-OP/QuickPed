import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/services/storage_service.dart';
import 'core/network/dio_client.dart';
import 'core/routing/app_router.dart';
import 'features/auth/providers/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Task 1: Initialize Hive Storage
  await StorageService.init();
  final storageService = StorageService();

  // We use a late initialization here because DioClient requires a callback for onUnauthorized.
  // The callback needs access to the ProviderContainer (or we handle routing internally).
  // For simplicity with Riverpod, we initialize DioClient and pass it to Riverpod overrides.
  
  runApp(
    ProviderScope(
      overrides: [
        storageServiceProvider.overrideWithValue(storageService),
        // dioClientProvider is overridden below inside the app builder to handle routing context if needed,
        // or we can initialize it here. Let's initialize it here with a generic unauth handler.
      ],
      child: const QuickPedApp(),
    ),
  );
}

class QuickPedApp extends ConsumerStatefulWidget {
  const QuickPedApp({super.key});

  @override
  ConsumerState<QuickPedApp> createState() => _QuickPedAppState();
}

class _QuickPedAppState extends ConsumerState<QuickPedApp> {
  late DioClient _dioClient;

  @override
  void initState() {
    super.initState();
    // Initialize DioClient and provide the onUnauthorized callback
    _dioClient = DioClient(
      storageService: ref.read(storageServiceProvider),
      onUnauthorized: () {
        // Force state to unauthenticated
        ref.read(authProvider.notifier).forceLogout();
        // GoRouter will automatically redirect to /login due to state change
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return ProviderScope(
      overrides: [
        dioClientProvider.overrideWithValue(_dioClient),
      ],
      child: Consumer(
        builder: (context, ref, child) {
          final router = ref.watch(routerProvider);

          return MaterialApp.router(
            title: 'QuickPed PWA',
            theme: ThemeData(
              primarySwatch: Colors.blue,
              useMaterial3: true,
            ),
            routerConfig: router,
          );
        },
      ),
    );
  }
}
