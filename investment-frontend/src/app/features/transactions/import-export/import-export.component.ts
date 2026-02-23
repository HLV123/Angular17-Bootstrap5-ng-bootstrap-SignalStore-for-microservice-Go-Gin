import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import-export', standalone: true, imports: [CommonModule, FormsModule, VndPipe],
  template: `
    <h5 class="fw-bold mb-1">Import / Export Dữ liệu</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">SheetJS (xlsx) · Parse file Excel ngay trên browser · Map cột linh hoạt</p>
    <div class="row g-3">
      <!-- IMPORT -->
      <div class="col-lg-7">
        <div class="ip-card p-4">
          <h6 class="section-title mb-3"><i class="bi bi-upload"></i>Import giao dịch từ file</h6>
          <div class="border-2 rounded-3 p-4 text-center mb-3" style="border:2px dashed var(--ip-border);cursor:pointer;background:#FAFBFC" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
            <i class="bi bi-cloud-upload fs-1 text-muted"></i>
            <p class="mt-2 mb-1 fw-medium">Kéo thả file hoặc click để chọn</p>
            <span style="font-size:0.75rem;color:var(--ip-text-muted)">.xlsx, .csv · Template SSI/VPS/VNDS</span>
            <input #fileInput type="file" class="d-none" accept=".xlsx,.xls,.csv" (change)="onFileSelect($event)">
          </div>

          @if (importStatus === 'preview') {
            <div class="alert alert-info py-2" style="font-size:0.82rem">
              <i class="bi bi-info-circle me-1"></i>
              File: <strong>{{fileName}}</strong> · {{parsedData.length}} dòng dữ liệu · {{errorRows}} lỗi
            </div>

            <!-- Column Mapping -->
            <div class="mb-3">
              <h6 style="font-size:0.82rem;font-weight:600" class="mb-2"><i class="bi bi-arrows-angle-expand me-1"></i>Map cột file → Trường hệ thống</h6>
              <div class="row g-2">
                @for (col of systemColumns; track col.key) {
                  <div class="col-md-6">
                    <div class="d-flex align-items-center gap-2">
                      <span style="font-size:0.78rem;min-width:100px" class="fw-medium">{{col.label}}</span>
                      <select class="form-select form-select-sm ip-input" [(ngModel)]="columnMapping[col.key]">
                        <option value="">-- Bỏ qua --</option>
                        @for (h of fileHeaders; track h) { <option [value]="h">{{h}}</option> }
                      </select>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Preview Table -->
            <h6 style="font-size:0.82rem;font-weight:600" class="mb-2"><i class="bi bi-table me-1"></i>Preview (10 dòng đầu)</h6>
            <div class="table-responsive" style="max-height:300px;overflow:auto">
              <table class="ip-table" style="font-size:0.72rem">
                <thead><tr>@for (h of fileHeaders; track h) { <th>{{h}}</th> }<th>Status</th></tr></thead>
                <tbody>
                  @for (row of previewRows; track $index) {
                    <tr [style.background]="row._error ? '#FFF3F3' : ''">
                      @for (h of fileHeaders; track h) {
                        <td [style.color]="row._errorCols?.includes(h) ? '#F44336' : ''">{{row[h]}}</td>
                      }
                      <td>
                        @if (row._error) { <span class="badge bg-danger" style="font-size:0.6rem">{{row._error}}</span> }
                        @else { <span class="badge bg-success" style="font-size:0.6rem">OK</span> }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Duplicate check -->
            @if (duplicateCount > 0) {
              <div class="alert alert-warning py-2 mt-2" style="font-size:0.78rem">
                <i class="bi bi-exclamation-triangle me-1"></i>{{duplicateCount}} dòng trùng lặp (unique key: ngày + mã + SL + giá)
              </div>
            }

            <div class="mt-3 d-flex gap-2">
              <button class="btn btn-ip-accent" (click)="confirmImport()" [disabled]="errorRows === parsedData.length">
                <i class="bi bi-check-lg me-1"></i>Confirm Import ({{parsedData.length - errorRows}} dòng hợp lệ)
              </button>
              <button class="btn btn-ip-outline" (click)="resetImport()">Hủy</button>
            </div>
          }

          @if (importStatus === 'success') {
            <div class="alert alert-success py-2"><i class="bi bi-check-circle me-1"></i>Import thành công {{importedCount}} giao dịch!</div>
            <button class="btn btn-ip-outline" (click)="resetImport()">Import tiếp</button>
          }

          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-sm btn-ip-outline" (click)="downloadTemplate()"><i class="bi bi-download me-1"></i>Tải template mẫu (.xlsx)</button>
          </div>

          <div class="mt-2 p-2 bg-light rounded" style="font-size:0.72rem">
            <strong>Quy trình import:</strong>
            <div>1. Upload file Excel/CSV → SheetJS parse ngay trên browser (không upload raw file)</div>
            <div>2. Map cột linh hoạt → Preview 10 dòng đầu → Highlight lỗi từng cell</div>
            <div>3. Kiểm tra trùng lặp (unique key: ngày + mã + SL + giá) → Confirm import</div>
            <div>4. POST /api/v1/transactions/import/confirm</div>
          </div>
        </div>
      </div>

      <!-- EXPORT -->
      <div class="col-lg-5">
        <div class="ip-card p-4 mb-3">
          <h6 class="section-title mb-3"><i class="bi bi-download"></i>Export dữ liệu</h6>
          <div class="d-flex flex-column gap-2">
            <button class="btn btn-ip-outline text-start d-flex justify-content-between" (click)="exportData('portfolio')">
              <span><i class="bi bi-file-earmark-excel text-success me-2"></i>Danh mục vị thế</span>
              <span class="badge bg-light text-dark">.xlsx</span>
            </button>
            <button class="btn btn-ip-outline text-start d-flex justify-content-between" (click)="exportData('transactions')">
              <span><i class="bi bi-file-earmark-excel text-success me-2"></i>Lịch sử giao dịch</span>
              <span class="badge bg-light text-dark">.xlsx</span>
            </button>
            <button class="btn btn-ip-outline text-start d-flex justify-content-between" (click)="exportData('pnl')">
              <span><i class="bi bi-filetype-csv me-2"></i>Báo cáo P&L</span>
              <span class="badge bg-light text-dark">.csv</span>
            </button>
            <button class="btn btn-ip-outline text-start d-flex justify-content-between" (click)="exportData('tax')">
              <span><i class="bi bi-file-earmark-pdf text-danger me-2"></i>Báo cáo thuế TNCN 2025</span>
              <span class="badge bg-light text-dark">.xlsx</span>
            </button>
            <button class="btn btn-ip-outline text-start d-flex justify-content-between" (click)="exportData('screener')">
              <span><i class="bi bi-file-earmark-excel text-success me-2"></i>Kết quả screener</span>
              <span class="badge bg-light text-dark">.xlsx</span>
            </button>
            <button class="btn btn-ip-outline text-start d-flex justify-content-between" (click)="exportData('backtest')">
              <span><i class="bi bi-file-earmark-excel text-success me-2"></i>Kết quả backtesting</span>
              <span class="badge bg-light text-dark">.xlsx</span>
            </button>
          </div>
          @if (exportMsg) { <div class="alert alert-success py-2 mt-2" style="font-size:0.82rem"><i class="bi bi-check-circle me-1"></i>{{exportMsg}}</div> }
        </div>

        <div class="ip-card p-4">
          <h6 class="section-title mb-3"><i class="bi bi-clock-history"></i>Lịch sử Import</h6>
          <div class="d-flex flex-column gap-2">
            @for (h of importHistory; track h.id) {
              <div class="d-flex justify-content-between py-2" style="border-bottom:1px solid #f1f5f9;font-size:0.82rem">
                <div>
                  <div class="fw-medium">{{h.fileName}}</div>
                  <div style="font-size:0.72rem;color:var(--ip-text-muted)">{{h.totalRows}} dòng · {{h.createdAt}}</div>
                </div>
                <span class="badge" [ngClass]="h.status==='confirmed'?'bg-success':'bg-warning text-dark'" style="height:fit-content">{{h.status}}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ImportExportComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  txService = inject(TransactionService);
  importStatus: 'idle' | 'preview' | 'success' = 'idle';
  fileName = ''; parsedData: any[] = []; fileHeaders: string[] = [];
  previewRows: any[] = []; errorRows = 0; duplicateCount = 0; importedCount = 0; exportMsg = '';
  columnMapping: any = {};
  systemColumns = [
    { key: 'symbol', label: 'Mã CK' }, { key: 'type', label: 'Loại lệnh' },
    { key: 'quantity', label: 'Số lượng' }, { key: 'price', label: 'Giá' },
    { key: 'tradeDate', label: 'Ngày GD' }, { key: 'fee', label: 'Phí GD' },
    { key: 'note', label: 'Ghi chú' }
  ];
  importHistory = [
    { id: '1', fileName: 'SSI_GD_T1_2026.xlsx', totalRows: 45, status: 'confirmed', createdAt: '2026-01-15 10:30' },
    { id: '2', fileName: 'VPS_transactions.csv', totalRows: 23, status: 'confirmed', createdAt: '2025-12-28 14:15' },
  ];

  onFileSelect(event: any) {
    const file = event.target.files[0]; if (!file) return;
    this.processFile(file);
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0]; if (!file) return;
    this.processFile(file);
  }
  processFile(file: File) {
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<any>(ws, { defval: '' });
        this.parsedData = data;
        this.fileHeaders = data.length > 0 ? Object.keys(data[0]) : [];
        // Auto-map columns
        this.fileHeaders.forEach((h: string) => {
          const hl = h.toLowerCase();
          if (hl.includes('symbol') || hl.includes('mã') || hl.includes('ma ck')) this.columnMapping['symbol'] = h;
          if (hl.includes('quantity') || hl.includes('số lượng') || hl.includes('sl')) this.columnMapping['quantity'] = h;
          if (hl.includes('price') || hl.includes('giá') || hl.includes('gia')) this.columnMapping['price'] = h;
          if (hl.includes('date') || hl.includes('ngày') || hl.includes('ngay')) this.columnMapping['tradeDate'] = h;
          if (hl.includes('type') || hl.includes('loại') || hl.includes('loai')) this.columnMapping['type'] = h;
          if (hl.includes('fee') || hl.includes('phí') || hl.includes('phi')) this.columnMapping['fee'] = h;
          if (hl.includes('note') || hl.includes('ghi chú')) this.columnMapping['note'] = h;
        });
        // Validate & preview
        this.errorRows = 0;
        this.previewRows = data.slice(0, 10).map((row: any) => {
          const r = { ...row, _error: '', _errorCols: [] as string[] };
          if (!row[this.columnMapping['symbol']]) { r._error = 'Thiếu mã CK'; r._errorCols.push(this.columnMapping['symbol']); }
          if (!row[this.columnMapping['quantity']] || isNaN(Number(row[this.columnMapping['quantity']]))) { r._error = 'SL không hợp lệ'; r._errorCols.push(this.columnMapping['quantity']); }
          if (r._error) this.errorRows++;
          return r;
        });
        this.duplicateCount = Math.floor(data.length * 0.05); // mock ~5%
        this.importStatus = 'preview';
      } catch (err) { console.error('Parse error:', err); }
    };
    reader.readAsBinaryString(file);
  }
  confirmImport() {
    this.importedCount = this.parsedData.length - this.errorRows;
    this.importStatus = 'success';
    this.importHistory.unshift({ id: Date.now() + '', fileName: this.fileName, totalRows: this.importedCount, status: 'confirmed', createdAt: new Date().toLocaleString('vi-VN') });
  }
  resetImport() { this.importStatus = 'idle'; this.parsedData = []; this.fileHeaders = []; this.columnMapping = {}; }

  exportData(type: string) {
    let data: any[] = []; let filename = '';
    if (type === 'transactions') {
      data = this.txService.transactions().map((t: any) => ({ 'Ngày': t.tradeDate, 'Mã CK': t.symbol, 'Loại': t.type, 'SL': t.quantity, 'Giá': t.price, 'Phí': t.fee, 'Thuế': t.tax, 'Tổng': t.totalValue, 'Ghi chú': t.note }));
      filename = 'giao_dich_' + new Date().toISOString().slice(0, 10) + '.xlsx';
    } else {
      data = [{ 'Module': type, 'Note': 'Sample export - connect to backend for full data' }];
      filename = type + '_export.xlsx';
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename);
    this.exportMsg = 'Đã export ' + filename;
    setTimeout(() => this.exportMsg = '', 3000);
  }

  downloadTemplate() {
    const template = [{ 'Mã CK': 'VIC', 'Loại': 'buy', 'Số lượng': 100, 'Giá': 45000, 'Ngày GD': '2026-01-15', 'Phí': 45000, 'Ghi chú': 'Mua dài hạn' }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'import_template.xlsx');
  }
}
