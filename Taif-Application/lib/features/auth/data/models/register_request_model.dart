/// Register Request Model
/// Maps to Server-api DTO: TAIF.Application.DTOs.Requests.RegisterRequest
class RegisterRequestModel {
  final String firstName;
  final String lastName;
  final String email;
  final String password;
  final DateTime? birthday;
  final int userRoleType;

  const RegisterRequestModel({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.password,
    this.birthday,
    this.userRoleType = 0,
  });

  Map<String, dynamic> toJson() => {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
        if (birthday != null)
          'birthday':
              '${birthday!.year}-${birthday!.month.toString().padLeft(2, '0')}-${birthday!.day.toString().padLeft(2, '0')}',
        'userRoleType': userRoleType,
      };
}
