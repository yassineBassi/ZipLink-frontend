import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AnalyticsService, UrlAnalytics } from '../../core/services/analytics.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-url-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="detail-page">
      <div class="bg-orbs">
        <div class="orb orb-1"></div>
      </div>

      <div class="back-nav" @fadeIn>
        <a routerLink="/dashboard" class="back-link">
          ← Back to Dashboard
        </a>
      </div>

      @if (loading()) {
        <div class="loading-state" @fadeIn>
          <div class="loading-spinner-large"></div>
          <p>Loading URL analytics...</p>
        </div>
      }

      @if (error()) {
        <div class="error-state" @fadeIn>
          <div class="error-icon">⚠️</div>
          <p>{{ error() }}</p>
          <button class="retry-btn" (click)="loadAnalytics()">Retry</button>
        </div>
      }

      @if (analytics(); as data) {
        <div class="detail-header" @fadeIn>
          <div class="code-badge">
            <span class="code-label">Short Code</span>
            <code class="code-value">{{ data.code }}</code>
          </div>
          <div class="click-count">
            <span class="count-number">{{ data.clickCount | number }}</span>
            <span class="count-label">Total Clicks</span>
          </div>
        </div>

        <div class="charts-row" @fadeIn>
          <div class="chart-card">
            <div class="chart-title">Clicks Over Time</div>
            <div class="chart-wrapper">
              <canvas #timelineChart></canvas>
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-title">Browser Distribution</div>
            <div class="chart-wrapper">
              <canvas #browserChart></canvas>
            </div>
          </div>
        </div>

        <div class="clicks-table-card" @fadeIn>
          <div class="table-header">
            <div class="chart-title">Recent Clicks</div>
            <div class="table-count">{{ data.clicks.length }} records</div>
          </div>

          @if (data.clicks.length > 0) {
            <div class="table-wrapper">
              <table class="clicks-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Time</th>
                    <th>IP Address</th>
                    <th>Browser</th>
                  </tr>
                </thead>
                <tbody>
                  @for (click of data.clicks.slice().reverse().slice(0, 50); track click.id; let i = $index) {
                    <tr>
                      <td class="row-num">{{ i + 1 }}</td>
                      <td class="time-cell">{{ click.time | date:'MMM d, y HH:mm:ss' }}</td>
                      <td class="ip-cell">{{ click.clientIp || 'Unknown' }}</td>
                      <td class="browser-cell">{{ click.clientBrowser | slice:0:60 }}{{ (click.clientBrowser.length || 0) > 60 ? '...' : '' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-msg">No clicks recorded yet</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page {
      min-height: 100vh;
      padding: 5.5rem 1.5rem 3rem;
      max-width: 1100px;
      margin: 0 auto;
      position: relative;
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
      filter: blur(120px);
      opacity: 0.07;
    }

    .orb-1 {
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, #7c3aed, transparent);
      top: -300px;
      left: 50%;
      transform: translateX(-50%);
    }

    .back-nav {
      margin-bottom: 2rem;
      position: relative;
      z-index: 1;
    }

    .back-link {
      color: rgba(255,255,255,0.4);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: rgba(255,255,255,0.8);
    }

    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      min-height: 300px;
      color: rgba(255,255,255,0.5);
      position: relative;
      z-index: 1;
    }

    .loading-spinner-large {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(167, 139, 250, 0.2);
      border-top-color: #a78bfa;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .error-icon { font-size: 2rem; }

    .retry-btn {
      padding: 0.5rem 1.5rem;
      background: rgba(167, 139, 250, 0.1);
      border: 1px solid rgba(167, 139, 250, 0.3);
      border-radius: 8px;
      color: #a78bfa;
      cursor: pointer;
      font-family: inherit;
    }

    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 1.5rem 2rem;
      position: relative;
      z-index: 1;
    }

    .code-label {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      display: block;
      margin-bottom: 0.4rem;
    }

    .code-value {
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 1.8rem;
      color: #a78bfa;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .click-count {
      text-align: right;
    }

    .count-number {
      display: block;
      font-size: 3rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1;
    }

    .count-label {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .chart-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .chart-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 1.25rem;
    }

    .chart-wrapper {
      position: relative;
      height: 220px;
    }

    .clicks-table-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .table-count {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.3);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .clicks-table {
      width: 100%;
      border-collapse: collapse;
    }

    .clicks-table th {
      text-align: left;
      padding: 0.6rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255,255,255,0.35);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .clicks-table td {
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.7);
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }

    .clicks-table tr:last-child td {
      border-bottom: none;
    }

    .clicks-table tr:hover td {
      background: rgba(255,255,255,0.02);
    }

    .row-num {
      color: rgba(255,255,255,0.25) !important;
      font-size: 0.75rem !important;
      width: 30px;
    }

    .time-cell { color: rgba(255,255,255,0.6) !important; white-space: nowrap; }
    .ip-cell { font-family: 'SF Mono', Consolas, monospace; font-size: 0.8rem !important; }
    .browser-cell { color: rgba(255,255,255,0.4) !important; font-size: 0.78rem !important; }

    .empty-msg {
      text-align: center;
      color: rgba(255,255,255,0.3);
      padding: 3rem;
    }

    @media (max-width: 700px) {
      .charts-row { grid-template-columns: 1fr; }
      .detail-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
    }
  `]
})
export class UrlDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('timelineChart') timelineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('browserChart') browserChartRef!: ElementRef<HTMLCanvasElement>;

  loading = signal(false);
  error = signal('');
  analytics = signal<UrlAnalytics | null>(null);
  code = '';

  private charts: Chart[] = [];

  constructor(
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code') || '';
    this.loadAnalytics();
  }

  ngAfterViewInit() {}

  loadAnalytics() {
    if (!this.code) return;
    this.loading.set(true);
    this.error.set('');

    this.analyticsService.getUrlAnalytics(this.code).subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.loading.set(false);
        setTimeout(() => this.renderCharts(data), 100);
      },
      error: (err) => {
        this.error.set('Failed to load analytics for this URL.');
        this.loading.set(false);
      }
    });
  }

  private renderCharts(data: UrlAnalytics) {
    this.destroyCharts();
    this.renderTimeline(data);
    this.renderBrowserChart(data);
  }

  private renderTimeline(data: UrlAnalytics) {
    if (!this.timelineChartRef?.nativeElement) return;
    const ctx = this.timelineChartRef.nativeElement.getContext('2d')!;

    // Group clicks by day
    const byDay: Record<string, number> = {};
    data.clicks.forEach(click => {
      const day = new Date(click.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      byDay[day] = (byDay[day] || 0) + 1;
    });

    const labels = Object.keys(byDay);
    const values = Object.values(byDay);

    this.charts.push(new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Clicks',
          data: values,
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167, 139, 250, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#a78bfa',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
            beginAtZero: true
          }
        }
      }
    }));
  }

  private renderBrowserChart(data: UrlAnalytics) {
    if (!this.browserChartRef?.nativeElement) return;
    const ctx = this.browserChartRef.nativeElement.getContext('2d')!;

    const browsers: Record<string, number> = {};
    data.clicks.forEach(click => {
      const browser = (click.clientBrowser || 'Unknown').substring(0, 20);
      browsers[browser] = (browsers[browser] || 0) + 1;
    });

    const colors = ['#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fb923c'];

    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(browsers),
        datasets: [{
          data: Object.values(browsers),
          backgroundColor: colors.map(c => c + '99'),
          borderColor: colors,
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: 'rgba(255,255,255,0.4)', font: { size: 9 }, padding: 8 }
          }
        },
        cutout: '65%'
      }
    }));
  }

  private destroyCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }
}
