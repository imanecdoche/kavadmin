import 'package:intl/intl.dart';

/// ⏱️ Session Time Evaluator & Indonesian Localization Helpers for Kavio Edu
class SessionTimeEvaluator {
  SessionTimeEvaluator._();

  static const List<String> dayNamesIndonesian = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
    'Minggu'
  ];

  static const Map<String, int> dayToWeekday = {
    'senin': DateTime.monday,
    'selasa': DateTime.tuesday,
    'rabu': DateTime.wednesday,
    'kamis': DateTime.thursday,
    'jumat': DateTime.friday,
    'sabtu': DateTime.saturday,
    'minggu': DateTime.sunday,
  };

  /// Evaluasi status sesi secara presisi berdasarkan tanggal dan jam slot sesi
  static Map<String, dynamic> evaluate({
    required String dateStr,
    required String timeStr,
    int durationMinutes = 90,
  }) {
    if (dateStr.isEmpty) {
      return {'status': 'BELUM MULAI', 'isCompleted': false};
    }

    try {
      final now = DateTime.now();
      final dateParts = dateStr.split('-').map(int.parse).toList();
      final timeParts = (timeStr.isEmpty ? '15:00' : timeStr).split(':').map(int.parse).toList();

      final sessionStart = DateTime(
        dateParts[0],
        dateParts[1],
        dateParts[2],
        timeParts[0],
        timeParts[1],
      );

      final sessionEnd = sessionStart.add(Duration(minutes: durationMinutes));

      if (now.isAfter(sessionEnd)) {
        return {'status': 'SELESAI', 'isCompleted': true};
      } else if (now.isAfter(sessionStart) && now.isBefore(sessionEnd)) {
        return {'status': 'SEDANG BERJALAN', 'isCompleted': false};
      } else {
        return {'status': 'BELUM MULAI', 'isCompleted': false};
      }
    } catch (_) {
      return {'status': 'BELUM MULAI', 'isCompleted': false};
    }
  }

  /// Format rupiah: Rp 1.500.000
  static String formatRupiah(num? amount) {
    if (amount == null) return 'Rp 0';
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  /// Format date to Indonesian: "12 Agustus 2026"
  static String formatDateIndonesian(DateTime? date) {
    if (date == null) return '-';
    final formatter = DateFormat('d MMMM yyyy', 'id_ID');
    return formatter.format(date);
  }

  /// Format date short: "12 Agu 2026"
  static String formatDateShort(DateTime? date) {
    if (date == null) return '-';
    final formatter = DateFormat('d MMM yyyy', 'id_ID');
    return formatter.format(date);
  }

  /// Terbilang converter in Bahasa Indonesia
  static String terbilang(int number) {
    if (number == 0) return 'Nol Rupiah';

    final List<String> units = [
      '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
    ];

    String convert(int n) {
      if (n < 12) {
        return units[n];
      } else if (n < 20) {
        return '${convert(n - 10)} Belas';
      } else if (n < 100) {
        final remainder = n % 10;
        final res = '${convert(n ~/ 10)} Puluh';
        return remainder > 0 ? '$res ${convert(remainder)}' : res;
      } else if (n < 200) {
        final remainder = n - 100;
        return remainder > 0 ? 'Seratus ${convert(remainder)}' : 'Seratus';
      } else if (n < 1000) {
        final remainder = n % 100;
        final res = '${convert(n ~/ 100)} Ratus';
        return remainder > 0 ? '$res ${convert(remainder)}' : res;
      } else if (n < 2000) {
        final remainder = n - 1000;
        return remainder > 0 ? 'Seribu ${convert(remainder)}' : 'Seribu';
      } else if (n < 1000000) {
        final remainder = n % 1000;
        final res = '${convert(n ~/ 1000)} Ribu';
        return remainder > 0 ? '$res ${convert(remainder)}' : res;
      } else if (n < 1000000000) {
        final remainder = n % 1000000;
        final res = '${convert(n ~/ 1000000)} Juta';
        return remainder > 0 ? '$res ${convert(remainder)}' : res;
      } else if (n < 1000000000000) {
        final remainder = n % 1000000000;
        final res = '${convert(n ~/ 1000000000)} Miliar';
        return remainder > 0 ? '$res ${convert(remainder)}' : res;
      } else {
        return '$n';
      }
    }

    final result = convert(number).replaceAll(RegExp(r'\s+'), ' ').trim();
    return '$result Rupiah';
  }

  /// Calculates upcoming sessions for the next 3 days given a list of scheduled days
  static List<DateTime> getUpcomingSessionDates(List<String> scheduleDays, {int daysAhead = 3}) {
    final List<DateTime> upcoming = [];
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    final Set<int> targetWeekdays = {};
    for (final day in scheduleDays) {
      final key = day.trim().toLowerCase();
      if (dayToWeekday.containsKey(key)) {
        targetWeekdays.add(dayToWeekday[key]!);
      }
    }

    if (targetWeekdays.isEmpty) return upcoming;

    for (int i = 0; i <= daysAhead; i++) {
      final date = today.add(Duration(days: i));
      if (targetWeekdays.contains(date.weekday)) {
        upcoming.add(date);
      }
    }

    return upcoming;
  }
}
