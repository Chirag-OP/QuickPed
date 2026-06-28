import 'package:hive_flutter/hive_flutter.dart';
class StorageService {
  static const String _boxName = 'authBox';
    static const String _tokenKey = 'jwt_token';
  static const String _phoneKey = 'phone';
  static const String _nameKey = 'name';
  static const String _emailKey = 'email';
  static const String _institutionKey = 'institution';
  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(_boxName);
  }
  Box get _box => Hive.box(_boxName);
  Future<void> saveToken(String token) async {
    await _box.put(_tokenKey, token);
  }
  String? getToken() {
    return _box.get(_tokenKey);
  }
  Future<void> deleteToken() async {
    await _box.delete(_tokenKey);
  }
  Future<void> savePhone(String phone) async {
    await _box.put(_phoneKey, phone);
  }
  String? getPhone() {
    return _box.get(_phoneKey);
  }
  Future<void> saveUserProfile({
    required String name,
    required String email,
    required String institution,
  }) async {
    await _box.put(_nameKey, name);
    await _box.put(_emailKey, email);
    await _box.put(_institutionKey, institution);
  }
  Map<String, String?> getUserProfile() {
    return {
      'phone': _box.get(_phoneKey),
      'name': _box.get(_nameKey),
      'email': _box.get(_emailKey),
      'institution': _box.get(_institutionKey),
    };
  }
  bool isProfileComplete() {
    final name = _box.get(_nameKey);
    final email = _box.get(_emailKey);
    final institution = _box.get(_institutionKey);
    return name != null && name.isNotEmpty && 
           email != null && email.isNotEmpty && 
           institution != null && institution.isNotEmpty;
  }
}
