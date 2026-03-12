import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { UrlService } from '../../core/services/url.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('resultCard', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(10px)' }),
        animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ]),
    trigger('pulse', [
      state('idle', style({ transform: 'scale(1)' })),
      state('active', style({ transform: 'scale(1.02)' })),
      transition('idle <=> active', animate('150ms ease-in-out'))
    ])
  ],
  template: `
    <div class="home-page">
      <div class="bg-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>

      <div class="hero" @fadeSlideIn>
        <div class="hero-badge">
          <span class="badge-dot"></span>
          URL Shortener
        </div>
        <h1 class="hero-title">
          Make your links
          <span class="gradient-text">unforgettable</span>
        </h1>
        <p class="hero-subtitle">
          Shorten, share, and track your URLs with real-time analytics.
        </p>
      </div>

      <div class="shorten-card" @fadeSlideIn>
        <form (ngSubmit)="shorten()" class="shorten-form">
          <div class="input-wrapper" [class.focused]="inputFocused" [class.error]="errorMsg()">
            <span class="input-icon">🔗</span>
            <input
              type="url"
              class="url-input"
              placeholder="https://your-long-url.com/paste/here"
              [(ngModel)]="urlInput"
              name="url"
              (focus)="inputFocused = true"
              (blur)="inputFocused = false"
              required
            />
          </div>

          @if (errorMsg()) {
            <div class="error-msg" @fadeSlideIn>{{ errorMsg() }}</div>
          }

          <button
            type="submit"
            class="shorten-btn"
            [class.loading]="loading()"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="spinner"></span>
              Shortening...
            } @else {
              <span>⚡</span>
              Shorten URL
            }
          </button>
        </form>
      </div>

      @if (result()) {
        <div class="result-card" @resultCard>
          <div class="result-header">
            <span class="result-icon">✅</span>
            <span class="result-title">URL Shortened!</span>
          </div>
          <div class="result-url-row">
            <div class="result-url">
              <span class="short-label">Short link</span>
              <a class="short-link" [href]="fullShortUrl()" target="_blank">{{ fullShortUrl() }}</a>
            </div>
            <div class="result-actions">
              <button class="action-btn copy-btn" (click)="copyToClipboard()" [class.copied]="copied()">
                {{ copied() ? '✓ Copied' : '📋 Copy' }}
              </button>
              <a class="action-btn analytics-btn" [routerLink]="['/url', result()!.code]">
                📊 Analytics
              </a>
            </div>
          </div>
          <div class="result-code">
            Code: <code>{{ result()!.code }}</code>
          </div>
        </div>
      }

      <div class="features-grid" @fadeSlideIn>
        @for (feature of features; track feature.icon) {
          <div class="feature-card">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .home-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 1.5rem 3rem;
      position: relative;
      overflow: hidden;
    }

    .bg-orbs {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.12;
      animation: floatOrb 8s ease-in-out infinite;
    }

    .orb-1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, #a78bfa, transparent);
      top: -100px;
      left: -150px;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #60a5fa, transparent);
      top: 200px;
      right: -100px;
      animation-delay: 3s;
    }

    .orb-3 {
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, #f472b6, transparent);
      bottom: 50px;
      left: 30%;
      animation-delay: 5s;
    }

    @keyframes floatOrb {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(20px, -20px) scale(1.05); }
      66% { transform: translate(-15px, 15px) scale(0.95); }
    }

    .hero {
      text-align: center;
      margin-bottom: 2.5rem;
      position: relative;
      z-index: 1;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      border-radius: 100px;
      background: rgba(167, 139, 250, 0.1);
      border: 1px solid rgba(167, 139, 250, 0.25);
      color: #a78bfa;
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      background: #a78bfa;
      border-radius: 50%;
      animation: pulse 2s ease infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.5); }
    }

    .hero-title {
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 800;
      color: #fff;
      line-height: 1.1;
      margin-bottom: 1rem;
      letter-spacing: -0.03em;
    }

    .gradient-text {
      background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.1rem;
      color: rgba(255,255,255,0.5);
      max-width: 450px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .shorten-card {
      width: 100%;
      max-width: 640px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 1.5rem;
      backdrop-filter: blur(20px);
      position: relative;
      z-index: 1;
      margin-bottom: 1.5rem;
    }

    .shorten-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      transition: all 0.25s ease;
    }

    .input-wrapper.focused {
      border-color: rgba(167, 139, 250, 0.5);
      background: rgba(167, 139, 250, 0.05);
      box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
    }

    .input-wrapper.error {
      border-color: rgba(248, 113, 113, 0.5);
    }

    .input-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .url-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 0.95rem;
      font-family: inherit;
    }

    .url-input::placeholder {
      color: rgba(255,255,255,0.25);
    }

    .error-msg {
      color: #f87171;
      font-size: 0.85rem;
      padding-left: 0.25rem;
    }

    .shorten-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem 2rem;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      font-family: inherit;
    }

    .shorten-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
    }

    .shorten-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .shorten-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .result-card {
      width: 100%;
      max-width: 640px;
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      position: relative;
      z-index: 1;
      margin-bottom: 1.5rem;
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
      color: #34d399;
    }

    .result-url-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .result-url {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .short-label {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .short-link {
      color: #a78bfa;
      text-decoration: none;
      font-size: 1.05rem;
      font-weight: 500;
      transition: color 0.2s;
    }

    .short-link:hover {
      color: #c4b5fd;
    }

    .result-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      font-family: inherit;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .copy-btn {
      background: rgba(255,255,255,0.08);
      color: #fff;
    }

    .copy-btn:hover {
      background: rgba(255,255,255,0.12);
    }

    .copy-btn.copied {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
    }

    .analytics-btn {
      background: rgba(167, 139, 250, 0.1);
      color: #a78bfa;
      border: 1px solid rgba(167, 139, 250, 0.2);
    }

    .analytics-btn:hover {
      background: rgba(167, 139, 250, 0.2);
    }

    .result-code {
      margin-top: 0.75rem;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.4);
    }

    .result-code code {
      background: rgba(255,255,255,0.06);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-family: 'SF Mono', Consolas, monospace;
      color: rgba(255,255,255,0.7);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      width: 100%;
      max-width: 640px;
      position: relative;
      z-index: 1;
      margin-top: 1rem;
    }

    .feature-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
      padding: 1.25rem;
      transition: all 0.25s ease;
    }

    .feature-card:hover {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.1);
      transform: translateY(-2px);
    }

    .feature-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .feature-card h3 {
      font-size: 0.9rem;
      font-weight: 600;
      color: #fff;
      margin: 0 0 0.25rem 0;
    }

    .feature-card p {
      font-size: 0.78rem;
      color: rgba(255,255,255,0.4);
      margin: 0;
      line-height: 1.5;
    }

    @media (max-width: 600px) {
      .features-grid {
        grid-template-columns: 1fr;
      }

      .result-url-row {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class HomeComponent {
  urlInput = '';
  inputFocused = false;

  loading = signal(false);
  errorMsg = signal('');
  result = signal<{ code: string } | null>(null);
  copied = signal(false);

  features = [
    { icon: '⚡', title: 'Instant Shortening', desc: 'Create short links in milliseconds' },
    { icon: '📊', title: 'Real-time Analytics', desc: 'Track clicks, browsers & trends' },
    { icon: '🔒', title: 'Reliable & Fast', desc: 'Redis-cached for speed' }
  ];

  constructor(private urlService: UrlService) {}

  shorten() {
    if (!this.urlInput.trim()) {
      this.errorMsg.set('Please enter a URL');
      return;
    }

    this.errorMsg.set('');
    this.loading.set(true);
    this.result.set(null);

    this.urlService.shorten(this.urlInput.trim()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
        this.urlInput = '';
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to shorten URL. Check the URL and try again.');
        this.loading.set(false);
      }
    });
  }

  fullShortUrl(): string {
    const code = this.result()?.code;
    return code ? `${window.location.origin}/r/${code}` : '';
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.fullShortUrl()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
