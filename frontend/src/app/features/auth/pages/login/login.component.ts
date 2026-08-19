import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  showPassword = signal(false);

  loginForm = this.fb.group({
    email: ['admin@orange.com', [Validators.required, Validators.email]],
    password: ['password', Validators.required],
  });

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    // Redirection directe vers le dashboard sans attendre l'API backend
    this.router.navigate(['/admin/dashboard']);
  }
}

