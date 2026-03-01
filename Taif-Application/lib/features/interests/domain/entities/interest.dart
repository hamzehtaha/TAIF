import '../../domain/entities/interest.dart';

/// Interest Entity
/// Domain entity representing a user interest/category
class Interest {
  final String id;
  final String name;

  const Interest({
    required this.id,
    required this.name,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Interest &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'Interest{id: $id, name: $name}';
}
