import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UrlService } from '../../core/services/url.service';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:1rem;color:rgba(255,255,255,0.5)">
      <div style="width:36px;height:36px;border:3px solid rgba(167,139,250,0.2);border-top-color:#a78bfa;border-radius:50%;animation:spin 0.8s linear infinite"></div>
      <p>Redirecting...</p>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>
  `
})
export class RedirectComponent implements OnInit {
  constructor(private route: ActivatedRoute, private urlService: UrlService) {}

  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code') || '';
    this.urlService.getOriginalUrl(code).subscribe({
      next: (url) => window.location.href = url,
      error: () => window.location.href = '/'
    });
  }
}
