import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/services/storage_service.dart';
import 'core/network/dio_client.dart';
import 'core/routing/app_router.dart';
import 'features/auth/providers/auth_provider.dart';
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await StorageService.init();
  final storageService = StorageService();
    runApp(
    ProviderScope(
      overrides: [
        storageServiceProvider.overrideWithValue(storageService),
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
    _dioClient = DioClient(
      storageService: ref.read(storageServiceProvider),
      onUnauthorized: () {
        ref.read(authProvider.notifier).forceLogout();
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
