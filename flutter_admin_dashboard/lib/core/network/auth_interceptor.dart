import 'package:dio/dio.dart';
import '../services/storage_service.dart';

class AuthInterceptor extends Interceptor {
  final StorageService _storageService;
  final void Function() _onUnauthorized;

  AuthInterceptor(this._storageService, this._onUnauthorized);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Task 2: automatically read JWT from StorageService and attach to header
    final token = _storageService.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Task 2: error-handling logic inside interceptor
    if (err.response?.statusCode == 401) {
      // automatically trigger deleteToken()
      _storageService.deleteToken();
      // force the router to push the user back to the Phone Login screen
      _onUnauthorized();
    }
    return handler.next(err);
  }
}
