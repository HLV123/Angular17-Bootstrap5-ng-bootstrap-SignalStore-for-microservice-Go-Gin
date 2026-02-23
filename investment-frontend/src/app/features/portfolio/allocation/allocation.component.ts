import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { MOCK_ALLOCATION_TARGETS } from '../../../core/mock-data';

@Component({
  selector: 'app-allocation', standalone: true, imports: [CommonModule],
  template: `
    <h5 class="fw-bold mb-1">Phân bổ Tài sản & Tái cân bằng</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">Thiết lập tỉ trọng mục tiêu và nhận gợi ý tái cân bằng</p>
    <div class="row g-3 mb-4">
      <div class="col-lg-6"><div class="ip-card p-3"><h6 class="section-title mb-3"><i class="bi bi-pie-chart"></i>Phân bổ hiện tại</h6><div id="allocPie" style="height:300px"></div></div></div>
      <div class="col-lg-6"><div class="ip-card p-3"><h6 class="section-title mb-3"><i class="bi bi-bar-chart"></i>Thực tế vs Mục tiêu</h6><div id="allocBar" style="height:300px"></div></div></div>
    </div>
    <div class="ip-card p-3">
      <h6 class="section-title mb-3"><i class="bi bi-arrow-repeat"></i>Gợi ý tái cân bằng</h6>
      <table class="ip-table"><thead><tr><th>Nhóm</th><th class="text-end">Mục tiêu</th><th class="text-end">Thực tế</th><th class="text-end">Chênh lệch</th><th>Hành động</th></tr></thead>
      <tbody>
        @for (t of targets; track t.category) {
          <tr><td class="fw-bold">{{t.category}}</td><td class="text-end">{{t.targetWeight}}%</td><td class="text-end">{{t.currentWeight}}%</td>
          <td class="text-end" [class]="t.deviation>0?'text-vn-red':'text-vn-green'">{{t.deviation>0?'+':''}}{{t.deviation|number:'1.1-1'}}%</td>
          <td><span class="badge" [ngClass]="t.deviation>2?'bg-warning text-dark':t.deviation<-2?'bg-info':'bg-light text-dark'">{{t.deviation>2?'Giảm':t.deviation<-2?'Tăng':'OK'}}</span></td></tr>
        }
      </tbody></table>
      <div class="mt-3"><button class="btn btn-ip-accent btn-sm"><i class="bi bi-play-fill me-1"></i>Simulate tái cân bằng</button></div>
    </div>
  `
})
export class AllocationComponent implements AfterViewInit {
  portfolio = inject(PortfolioService);
  targets = MOCK_ALLOCATION_TARGETS;
  ngAfterViewInit() { this.initCharts(); }
  initCharts() {
    const echarts = (window as any)['echarts']; if (!echarts) return;
    const pie = echarts.init(document.getElementById('allocPie'));
    const data = this.portfolio.getPortfolioAllocation();
    pie.setOption({ tooltip:{trigger:'item'}, series:[{type:'pie',radius:['40%','65%'],data:data.map((d:any)=>({value:d.value,name:d.name})),color:['#00B4D8','#F44336','#00C853','#FFD600','#AA00FF','#FF9800']}]});
    const bar = echarts.init(document.getElementById('allocBar'));
    bar.setOption({ tooltip:{}, grid:{left:80,right:20,top:20,bottom:30}, xAxis:{type:'category',data:this.targets.map(t=>t.category)}, yAxis:{type:'value',axisLabel:{formatter:'{value}%'}}, series:[{name:'Mục tiêu',type:'bar',data:this.targets.map(t=>t.targetWeight),color:'#00B4D8'},{name:'Thực tế',type:'bar',data:this.targets.map(t=>t.currentWeight),color:'#FFD600'}]});
    window.addEventListener('resize', () => { pie.resize(); bar.resize(); });
  }
}
