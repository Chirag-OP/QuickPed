import 'package:dio/dio.dart';
import 'auth_interceptor.dart';
import '../services/storage_service.dart';
class DioClient {
  final Dio dio;
  DioClient({required StorageService storageService, required void Function() onUnauthorized}) 
    : dio = Dio(
      BaseOptions(
        baseUrl: '/api/v1', 
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
      )
    ) {
    dio.interceptors.add(AuthInterceptor(storageService, onUnauthorized));
  }
}
