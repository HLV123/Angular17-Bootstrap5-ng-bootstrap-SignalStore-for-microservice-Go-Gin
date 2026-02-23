# HƯỚNG DẪN CÀI MÔI TRƯỜNG — Windows

Toàn bộ những gì cần cài để chạy full project (Frontend Angular + Backend Go Microservices + Database + BI Tools) trên máy Windows.

---

## MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Bắt buộc — Frontend](#2-bắt-buộc--frontend)
3. [Bắt buộc — Backend](#3-bắt-buộc--backend)
4. [Bắt buộc — Database & Cache](#4-bắt-buộc--database--cache)
5. [Bắt buộc — Container & Build tools](#5-bắt-buộc--container--build-tools)
6. [Tùy chọn — BI Tools](#6-tùy-chọn--bi-tools)
7. [Tùy chọn — Công cụ phát triển](#7-tùy-chọn--công-cụ-phát-triển)
8. [Xác nhận cài đặt](#8-xác-nhận-cài-đặt)
9. [Thứ tự khởi chạy](#9-thứ-tự-khởi-chạy)

---

## 1. TỔNG QUAN

| Nhóm | Phần mềm | Mục đích |
|------|----------|----------|
| Runtime | Node.js, Go | Chạy frontend và backend |
| Database | MariaDB, Redis | Lưu trữ dữ liệu, cache |
| Container | Docker Desktop | Chạy tất cả services |
| Build | Git, Protoc, Make | Quản lý code, build proto, automation |
| IDE | VS Code | Viết code |
| BI | Tableau, Power BI, Cognos | Tích hợp báo cáo (tùy chọn) |

---

## 2. BẮT BUỘC — FRONTEND

### 2.1 Node.js 20 LTS
Cài xong mở PowerShell kiểm tra:

```powershell
node --version       # v20.x.x
npm --version        # 10.x.x
```

### 2.2 Angular CLI

```powershell
npm install -g @angular/cli@17
```

Kiểm tra:

```powershell
ng version           # Angular CLI: 17.3.x
```

### 2.3 (Tùy chọn) Yarn

Thay thế npm, nhanh hơn:

```powershell
npm install -g yarn
```

---

## 3. BẮT BUỘC — BACKEND

### 3.1 Go 1.22+

```
Tải:   https://go.dev/dl/
File:  go1.22.x.windows-amd64.msi
```

Cài mặc định vào `C:\Program Files\Go`. Cài xong:

```powershell
go version           # go1.22.x windows/amd64
```

Thiết lập biến môi trường (PowerShell):

```powershell
# Go module proxy (tăng tốc tải package ở VN)
$env:GOPROXY = "https://proxy.golang.org,direct"

# Hoặc thêm vĩnh viễn vào System Environment Variables:
# GOPATH = C:\Users\<tên>\go
# GOPROXY = https://proxy.golang.org,direct
```

### 3.2 Protocol Buffers Compiler (protoc)

gRPC giữa các microservices dùng Protobuf.

```
Tải:   https://github.com/protocolbuffers/protobuf/releases
File:  protoc-2x.x-win64.zip
```

Giải nén, copy `protoc.exe` vào thư mục nằm trong PATH (ví dụ `C:\tools\protoc\bin`), thêm vào PATH.

Cài Go plugins cho protoc:

```powershell
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

Kiểm tra:

```powershell
protoc --version                # libprotoc 2x.x
protoc-gen-go --version         # (không lỗi là OK)
protoc-gen-go-grpc --version    # (không lỗi là OK)
```

### 3.3 (Tùy chọn) Buf CLI

Thay thế protoc, quản lý proto files dễ hơn:

```powershell
# Cài qua Go
go install github.com/bufbuild/buf/cmd/buf@latest

buf --version
```

### 3.4 (Tùy chọn) Air — Hot reload cho Go

Tự restart Go server khi save file:

```powershell
go install github.com/air-verse/air@latest

air --version
```

---

## 4. BẮT BUỘC — DATABASE & CACHE

### 4.1 MariaDB 11

Có 2 cách cài:

**Cách 1 — MSI Installer (đơn giản):**

```
Tải:   https://mariadb.org/download/?t=mariadb&p=mariadb&r=11.4
File:  mariadb-11.4.x-winx64.msi
```

Trong quá trình cài:
- Đặt root password (ghi nhớ)
- Port mặc định: `3306`
- Check "Use UTF8 as default server's character set"
- Check "Install as service" → tự chạy khi Windows khởi động

**Cách 2 — Docker (khuyên dùng, xem mục 5):**

```powershell
docker run -d --name mariadb -p 3306:3306 -e MARIADB_ROOT_PASSWORD=root123 mariadb:11
```

Kiểm tra kết nối:

```powershell
mysql -u root -p -h 127.0.0.1 -P 3306
# hoặc dùng HeidiSQL / DBeaver
```

### 4.2 Redis 7

Windows không có Redis chính thức. Có 3 cách:

**Cách  Docker :**

```powershell
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

Kiểm tra:

```powershell
redis-cli ping       # PONG
```

### 4.3 (Tùy chọn) IBM Db2

Chỉ cần nếu dùng Db2 thay MariaDB:

```
Tải:   https://www.ibm.com/products/db2/developers
File:  Db2 Community Edition (free)
```

Hoặc qua Docker:

```powershell
docker run -d --name db2 -p 50000:50000 -e DB2INST1_PASSWORD=db2pass -e LICENSE=accept ibmcom/db2
```

---

## 5. BẮT BUỘC — CONTAINER & BUILD TOOLS

### 5.1 Docker Desktop

Yêu cầu:
- Windows 10/11 64-bit
- BIOS bật Virtualization (VT-x / AMD-V)
- WSL2 backend (Docker Desktop sẽ hướng dẫn cài)

Cài xong:

```powershell
docker --version          # Docker version 2x.x.x
docker compose version    # Docker Compose version v2.x.x
```

### 5.2 WSL2 (Windows Subsystem for Linux)

Docker Desktop cần WSL2. Nếu chưa có:

```powershell
# PowerShell (Run as Administrator)
wsl --install
# Restart máy, sau đó chọn Ubuntu 22.04 làm distro mặc định
```

Kiểm tra:

```powershell
wsl --list --verbose     # Ubuntu ... Running ... 2
```

### 5.3 Make (GNU Make)

Makefile dùng để build, test, run các services.

**Cách 1 — Chocolatey:**

```powershell
# Cài Chocolatey trước (PowerShell Admin)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Sau đó cài Make
choco install make
```

**Cách 2 — Scoop:**

```powershell
scoop install make
```

```powershell
make --version           # GNU Make 4.x
```

---

## 6. TÙY CHỌN — BI TOOLS

Chỉ cần cài nếu muốn tích hợp BI embed thực tế. Frontend đã có placeholder UI chạy được mà không cần các tool này.

### 6.1 Tableau

```
Tableau Desktop (trial):   https://www.tableau.com/products/trial
Tableau Public (free):     https://public.tableau.com/app/discover
```

Cần Tableau Server hoặc Tableau Cloud để embed vào Angular qua Tableau Embedding API v3.

### 6.2 Power BI Desktop

```
Tải:   Microsoft Store → tìm "Power BI Desktop" (miễn phí)
Hoặc:  https://powerbi.microsoft.com/en-us/desktop/
```

Cần Power BI Pro/Premium license + Azure AD tenant để dùng Power BI Embedded SDK.

### 6.3 IBM Cognos Analytics

```
Tải:   https://www.ibm.com/products/cognos-analytics
```

Cần IBM Cognos Analytics server để tích hợp REST API. Có bản trial.

### 6.4 Apache OpenOffice

Dùng cho export ODB/CSV backup offline:

```
Tải:   https://www.openoffice.org/download/
File:  Apache_OpenOffice_4.x.x_Win_x86_install_en-US.exe
```

---

## 7. TÙY CHỌN — CÔNG CỤ PHÁT TRIỂN

### 7.1 Database GUI Client

Một trong các tool sau để quản lý MariaDB/Db2:

```
HeidiSQL (free):           https://www.heidisql.com/download.php
DBeaver Community (free):  https://dbeaver.io/download/
DataGrip (paid):           https://www.jetbrains.com/datagrip/
```

### 7.2 Redis GUI Client

```
Another Redis Desktop Manager (free):  https://github.com/qishibo/AnotherRedisDesktopManager
RedisInsight (free, by Redis):         https://redis.io/insight/
```

### 7.3 API Testing

```
Postman:       https://www.postman.com/downloads/
Insomnia:      https://insomnia.rest/download
```

Hoặc dùng VS Code extension REST Client / Thunder Client.

### 7.4 Protobuf & gRPC Testing

```
grpcurl:       go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
grpcui:        go install github.com/fullstorydev/grpcui/cmd/grpcui@latest
BloomRPC:      https://github.com/bloomrpc/bloomrpc (GUI cho gRPC)
```

---

## 8. XÁC NHẬN CÀI ĐẶT

Mở PowerShell, chạy từng lệnh. Tất cả phải trả về version, không lỗi:

```powershell
# ===== Bắt buộc =====
node --version               # v20.x.x
npm --version                # 10.x.x
ng version                   # Angular CLI: 17.3.x
go version                   # go1.22.x windows/amd64
git --version                # git version 2.x.x
docker --version             # Docker version 2x.x.x
docker compose version       # Docker Compose version v2.x.x
protoc --version             # libprotoc 2x.x
make --version               # GNU Make 4.x

# ===== Database (chọn 1 trong các cách) =====
mysql --version              # mysql Ver 15.1 Distrib 11.x.x-MariaDB (nếu cài MSI)
docker ps                    # mariadb, redis containers running (nếu dùng Docker)
redis-cli ping               # PONG

# ===== Tùy chọn =====
air --version                # air version x.x.x (Go hot reload)
buf --version                # buf version x.x.x (protobuf manager)
yarn --version               # 1.22.x
```

---

## 9. THỨ TỰ KHỞI CHẠY

Sau khi cài đặt xong tất cả, thứ tự khởi động full project:

```
Bước 1 │  Docker Desktop              Mở Docker Desktop, đợi engine sẵn sàng
       │
Bước 2 │  MariaDB + Redis             docker compose up -d mariadb redis
       │                               (đợi 10s cho DB khởi tạo)
       │
Bước 3 │  Database migration           cd investment-backend
       │                               ./scripts/migrate.sh up
       │                               ./scripts/seed.sh
       │
Bước 4 │  Protobuf generate            ./scripts/proto-gen.sh
       │
Bước 5 │  Backend services             docker compose up -d
       │                               (khởi động 10 services)
       │
Bước 6 │  Frontend                     cd investment-frontend
       │                               npm install
       │                               ng serve
       │
Bước 7 │  Mở trình duyệt              http://localhost:4200
       │                               Đăng nhập: investor@investment.vn / 123456
```

Nếu chỉ muốn chạy frontend với mock data (không cần backend):

```
Bước 1 │  cd investment-frontend
Bước 2 │  npm install
Bước 3 │  ng serve
Bước 4 │  http://localhost:4200
```

---
