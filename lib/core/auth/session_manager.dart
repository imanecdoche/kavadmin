import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? errorMessage;
  final String? sessionConflictMessage;

  AuthState({
    required this.isAuthenticated,
    this.isLoading = true,
    this.errorMessage,
    this.sessionConflictMessage,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? errorMessage,
    String? sessionConflictMessage,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      sessionConflictMessage: sessionConflictMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState(isAuthenticated: false)) {
    initAuthSession();
  }

  static const String _passcode = '200805';
  static const String _sessionStorageKey = 'kavadmin_session_token';
  static const String _authCollection = 'system_auth';
  static const String _authDocId = 'global_session';

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  StreamSubscription<DocumentSnapshot>? _sessionSubscription;

  Future<void> initAuthSession() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final prefs = await SharedPreferences.getInstance();
      final localToken = prefs.getString(_sessionStorageKey);

      if (localToken == null || localToken.isEmpty) {
        state = state.copyWith(isAuthenticated: false, isLoading: false);
        return;
      }

      // Pasang listener real-time ke Firestore
      _listenToGlobalSession(localToken);
    } catch (e) {
      state = state.copyWith(
        isAuthenticated: false,
        isLoading: false,
        errorMessage: 'Gagal memverifikasi sesi lokal: $e',
      );
    }
  }

  void _listenToGlobalSession(String localToken) {
    _sessionSubscription?.cancel();

    _sessionSubscription = _firestore
        .collection(_authCollection)
        .doc(_authDocId)
        .snapshots()
        .listen((snapshot) async {
      if (snapshot.exists && snapshot.data() != null) {
        final serverToken = (snapshot.data() as Map<String, dynamic>?)?['activeSessionId'] as String?;

        if (serverToken == localToken) {
          state = state.copyWith(
            isAuthenticated: true,
            isLoading: false,
            sessionConflictMessage: null,
          );
        } else {
          // Token telah digantikan oleh sesi login baru di tempat lain
          await _forceLogout(
            'Sesi Anda telah berakhir karena akun dibuka di perangkat/browser lain.',
          );
        }
      } else {
        await _forceLogout('Sesi tidak terdaftar di server.');
      }
    }, onError: (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Koneksi ke server terputus: $error',
      );
    });
  }

  Future<bool> loginWithPasscode(String inputPasscode) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    if (inputPasscode.trim() != _passcode) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Kode akses salah. Silakan coba lagi.',
      );
      return false;
    }

    try {
      final newToken = 'sess_${DateTime.now().millisecondsSinceEpoch}_${(1000 + (DateTime.now().microsecond % 9000))}';
      
      // Update dokumen Firestore
      await _firestore.collection(_authCollection).doc(_authDocId).set({
        'activeSessionId': newToken,
        'lastLoginAt': FieldValue.serverTimestamp(),
        'platform': 'Flutter Android',
      }, SetOptions(merge: true));

      // Simpan token lokal
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_sessionStorageKey, newToken);

      // Jalankan listener Firestore
      _listenToGlobalSession(newToken);

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        sessionConflictMessage: null,
        errorMessage: null,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Terjadi kesalahan saat menghubungi server: $e',
      );
      return false;
    }
  }

  Future<void> _forceLogout(String message) async {
    _sessionSubscription?.cancel();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionStorageKey);

    state = AuthState(
      isAuthenticated: false,
      isLoading: false,
      sessionConflictMessage: message,
    );
  }

  Future<void> manualLogout() async {
    _sessionSubscription?.cancel();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionStorageKey);

    state = AuthState(
      isAuthenticated: false,
      isLoading: false,
      sessionConflictMessage: null,
      errorMessage: null,
    );
  }

  @override
  void dispose() {
    _sessionSubscription?.cancel();
    super.dispose();
  }
}
