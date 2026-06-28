import 'package:dio/dio.dart';
import '../services/storage_service.dart';
class AuthInterceptor extends Interceptor {
  final StorageService _storageService;
  final void Function() _onUnauthorized;
  AuthInterceptor(this._storageService, this._onUnauthorized);
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = _storageService.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  }
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      _storageService.deleteToken();
      _onUnauthorized();
    }
    return handler.next(err);
  }
}
