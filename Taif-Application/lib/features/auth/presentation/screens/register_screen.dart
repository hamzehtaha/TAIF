import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/routing/app_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/bloc/theme_bloc.dart';
import '../../../../core/utils/app_localizations.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

/// Map error messages to localization keys
String _getLocalizedErrorMessage(BuildContext context, String errorMessage) {
  final l10n = context.l10n;

  if (errorMessage.contains('Invalid request')) {
    return l10n.translate('error_invalid_request');
  } else if (errorMessage.contains('Invalid credentials')) {
    return l10n.translate('error_invalid_credentials');
  } else if (errorMessage.contains('already exists')) {
    return l10n.translate('error_account_exists');
  } else if (errorMessage.contains('Server error')) {
    return l10n.translate('error_server');
  } else if (errorMessage.contains('Connection timeout')) {
    return l10n.translate('no_internet');
  }

  return errorMessage;
}

/// TAIF Create Account Screen - SELS Design
/// Matches the provided UI design with:
/// - SELS logo header
/// - Create Account title
/// - First Name & Last Name fields side by side
/// - Email and Password fields
/// - Password requirements checklist
/// - Terms checkbox
/// - Sign Up button
/// - Sign in navigation link
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _birthdayController = TextEditingController();
  DateTime? _selectedBirthday;
  bool _obscurePassword = true;
  bool _agreeToTerms = false;

  // Password requirements tracking
  bool _hasMinLength = false;
  bool _hasUppercase = false;
  bool _hasLowercase = false;
  bool _hasNumber = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _birthdayController.dispose();
    super.dispose();
  }

  void _checkPasswordRequirements(String password) {
    setState(() {
      _hasMinLength = password.length >= 8;
      _hasUppercase = password.contains(RegExp(r'[A-Z]'));
      _hasLowercase = password.contains(RegExp(r'[a-z]'));
      _hasNumber = password.contains(RegExp(r'[0-9]'));
    });
  }

  bool get _isPasswordValid =>
      _hasMinLength && _hasUppercase && _hasLowercase && _hasNumber;

  void _register() {
    if (!_formKey.currentState!.validate()) return;

    if (!_agreeToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(24),
          content: Text(
            context.l10n.translate('error_terms_required'),
            style: const TextStyle(color: AppColors.white),
          ),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    if (!_isPasswordValid) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(24),
          content: Text(
            context.l10n.translate('error_password_requirements'),
            style: const TextStyle(color: AppColors.white),
          ),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    context.read<AuthBloc>().add(
          RegisterRequested(
            firstName: _firstNameController.text.trim(),
            lastName: _lastNameController.text.trim(),
            email: _emailController.text.trim(),
            password: _passwordController.text,
            birthday: _selectedBirthday,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return BlocListener<ThemeBloc, ThemeState>(
        listener: (context, state) {
          // Rebuild when theme changes
          setState(() {});
        },
        child: Scaffold(
          backgroundColor: Theme.of(context).colorScheme.surface,
          appBar: AppBar(
            backgroundColor: Theme.of(context).colorScheme.surface,
            elevation: 0,
            foregroundColor: Theme.of(context).colorScheme.onSurface,
            actions: [
              IconButton(
                icon: const Icon(Icons.settings_outlined),
                onPressed: () => context.push(AppRoutes.settings),
              ),
            ],
          ),
          body: BlocListener<AuthBloc, AuthState>(
            listener: (context, state) {
              if (state is Authenticated) {
                // Navigate to interests screen after signup
                context.go(AppRoutes.userInterests);
              } else if (state is AuthError) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    behavior: SnackBarBehavior.floating,
                    margin: const EdgeInsets.all(24),
                    content: Text(
                      _getLocalizedErrorMessage(context, state.message),
                      style: const TextStyle(color: AppColors.white),
                    ),
                    backgroundColor: AppColors.error,
                  ),
                );
              }
            },
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      const SizedBox(height: 20),

                      // SELS Logo
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Center(
                          child: Text(
                            'SELS',
                            style: TextStyle(
                              color: AppColors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Create Account Title
                      Text(
                        l10n.translate('create_account'),
                        style: Theme.of(context)
                            .textTheme
                            .headlineMedium
                            ?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.onSurface,
                            ),
                      ),
                      const SizedBox(height: 8),

                      // Subtitle
                      Text(
                        l10n.translate('start_learning'),
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: Theme.of(context)
                                  .colorScheme
                                  .onSurfaceVariant,
                            ),
                      ),
                      const SizedBox(height: 32),

                      // First Name & Last Name Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel(l10n.translate('first_name')),
                                const SizedBox(height: 8),
                                _buildTextField(
                                  controller: _firstNameController,
                                  hintText: l10n.translate('first_name_hint'),
                                  prefixIcon: Icons.person_outline,
                                  validator: (value) {
                                    if (value?.isEmpty ?? true) {
                                      return 'Required';
                                    }
                                    return null;
                                  },
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel(l10n.translate('last_name')),
                                const SizedBox(height: 8),
                                _buildTextField(
                                  controller: _lastNameController,
                                  hintText: l10n.translate('last_name_hint'),
                                  prefixIcon: Icons.person_outline,
                                  validator: (value) {
                                    if (value?.isEmpty ?? true) {
                                      return 'Required';
                                    }
                                    return null;
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Email Field
                      _buildLabel(l10n.translate('email')),
                      const SizedBox(height: 8),
                      _buildTextField(
                        controller: _emailController,
                        hintText: l10n.translate('email_hint'),
                        prefixIcon: Icons.email_outlined,
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) {
                          if (value?.isEmpty ?? true) {
                            return l10n.translate('validation_email_required');
                          }
                          if (!RegExp(r'^[\w.-]+@[\w.-]+\.\w+$')
                              .hasMatch(value!)) {
                            return l10n.translate('validation_email');
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Birthday Field
                      _buildLabel(l10n.translate('birthday')),
                      const SizedBox(height: 8),
                      _buildDatePicker(),
                      const SizedBox(height: 16),

                      // Password Field
                      _buildLabel(l10n.translate('password')),
                      const SizedBox(height: 8),
                      _buildTextField(
                        controller: _passwordController,
                        hintText: l10n.translate('password_hint'),
                        prefixIcon: Icons.lock_outline,
                        obscureText: _obscurePassword,
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            color:
                                Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                        ),
                        onChanged: _checkPasswordRequirements,
                        validator: (value) {
                          if (value?.isEmpty ?? true) {
                            return l10n
                                .translate('validation_password_required');
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Password Requirements
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildRequirementRow(
                            l10n.translate('password_requirement_length'),
                            _hasMinLength,
                          ),
                          const SizedBox(height: 8),
                          _buildRequirementRow(
                            l10n.translate('password_requirement_uppercase'),
                            _hasUppercase,
                          ),
                          const SizedBox(height: 8),
                          _buildRequirementRow(
                            l10n.translate('password_requirement_lowercase'),
                            _hasLowercase,
                          ),
                          const SizedBox(height: 8),
                          _buildRequirementRow(
                            l10n.translate('password_requirement_number'),
                            _hasNumber,
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Terms Checkbox
                      Row(
                        children: [
                          SizedBox(
                            width: 20,
                            height: 20,
                            child: Checkbox(
                              value: _agreeToTerms,
                              onChanged: (value) {
                                setState(() {
                                  _agreeToTerms = value ?? false;
                                });
                              },
                              activeColor: AppColors.primary,
                              side: BorderSide(
                                color: Theme.of(context).colorScheme.outline,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              l10n.translate('agree_to_terms'),
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.onSurface,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Sign Up Button
                      BlocBuilder<AuthBloc, AuthState>(
                        builder: (context, state) {
                          final isLoading = state is AuthLoading;

                          return SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton(
                              onPressed: isLoading ? null : _register,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: AppColors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: isLoading
                                  ? const SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                          AppColors.white,
                                        ),
                                      ),
                                    )
                                  : Text(
                                      l10n.translate('sign_up'),
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 24),

                      // Sign in link
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            l10n.translate('already_have_account'),
                            style: TextStyle(
                              color: Theme.of(context)
                                  .colorScheme
                                  .onSurfaceVariant,
                              fontSize: 14,
                            ),
                          ),
                          GestureDetector(
                            onTap: () => context.push(AppRoutes.login),
                            child: Text(
                              l10n.translate('sign_in'),
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ));
  }

  Widget _buildLabel(String text) => Text(
        text,
        style: TextStyle(
          color: Theme.of(context).colorScheme.onSurface,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      );

  Widget _buildTextField({
    required TextEditingController controller,
    required String hintText,
    required IconData prefixIcon,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffixIcon,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
  }) =>
      TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscureText,
        validator: validator,
        onChanged: onChanged,
        style: const TextStyle(color: AppColors.gray900),
        decoration: InputDecoration(
          filled: true,
          fillColor: AppColors.secondary,
          hintText: hintText,
          hintStyle: const TextStyle(
            color: AppColors.gray500,
            fontSize: 16,
          ),
          prefixIcon: Icon(
            prefixIcon,
            color: AppColors.gray500,
            size: 20,
          ),
          suffixIcon: suffixIcon,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.error),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.error, width: 1.5),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 16,
          ),
        ),
      );

  Widget _buildRequirementRow(String text, bool isMet) => Row(
        children: [
          Icon(
            isMet ? Icons.check : Icons.close,
            size: 16,
            color: isMet ? AppColors.primary : AppColors.gray400,
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              color: isMet ? AppColors.gray700 : AppColors.gray500,
              fontSize: 13,
            ),
          ),
        ],
      );

  Widget _buildDatePicker() => GestureDetector(
        onTap: () async {
          final picked = await showDatePicker(
            context: context,
            initialDate: _selectedBirthday ?? DateTime(2000),
            firstDate: DateTime(1900),
            lastDate: DateTime.now(),
          );
          if (picked != null) {
            setState(() {
              _selectedBirthday = picked;
              _birthdayController.text =
                  '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
            });
          }
        },
        child: AbsorbPointer(
          child: TextFormField(
            controller: _birthdayController,
            style: const TextStyle(color: AppColors.gray900),
            decoration: InputDecoration(
              filled: true,
              fillColor: AppColors.secondary,
              hintText: 'YYYY-MM-DD',
              hintStyle: const TextStyle(
                color: AppColors.gray500,
                fontSize: 16,
              ),
              prefixIcon: const Icon(
                Icons.calendar_today_outlined,
                color: AppColors.gray500,
                size: 20,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                    const BorderSide(color: AppColors.primary, width: 1.5),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 16,
              ),
            ),
          ),
        ),
      );
}
