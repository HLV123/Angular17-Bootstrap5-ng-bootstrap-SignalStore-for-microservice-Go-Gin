import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { MarketService } from '../../core/services/market.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="main-wrapper">
      <aside class="sidebar-wrapper">
        <app-sidebar />
      </aside>
      <div class="content-wrapper">
        <header class="topbar-wrapper">
          <app-header />
        </header>
        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private market = inject(MarketService);
  ngOnInit(): void { this.market.startRealtimeSimulation(); }
  ngOnDestroy(): void { this.market.stopRealtimeSimulation(); }
}
