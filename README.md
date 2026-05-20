# 🚀 HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY DỰ ÁN UTESHOP

Tài liệu này hướng dẫn chi tiết từng bước từ cài đặt môi trường, cấu hình dữ liệu, chạy dữ liệu mẫu (seed data) cho đến khởi chạy ứng dụng (Backend & Frontend) trong cấu trúc thư mục mới:
*   `backend/`: Chứa mã nguồn máy chủ (Node.js & Express).
*   `frontend/`: Chứa mã nguồn ứng dụng khách (React & Vite).

---

## 📌 YÊU CẦU HỆ THỐNG
*   **Node.js**: Phiên bản `18.x` hoặc cao hơn.
*   **MongoDB**: MongoDB Community Server chạy local (`mongodb://localhost:27017`) hoặc URI MongoDB Atlas.
*   **Trình duyệt**: Chrome, Edge hoặc bất kỳ trình duyệt hiện đại nào.

---

## 🛠️ BƯỚC 1: THIẾT LẬP MÔI TRƯỜNG CHO BACKEND (ENVIRONMENT CONFIG)

1.  Di chuyển vào thư mục **`backend/`** của dự án:
    ```bash
    cd backend
    ```
2.  Sao chép tệp mẫu cấu hình để tạo tệp tin **`.env`**:
    ```bash
    cp .env.example .env
    ```
3.  Mở tệp `.env` vừa tạo và điền các tham số cấu hình cần thiết:
    ```env
    # Cấu hình đường dẫn kết nối MongoDB (Local hoặc Atlas)
    MONGODB_URI=mongodb://localhost:27017/uteshop_db_caNhan

    # Cổng khởi chạy Server của Backend
    PORT=5000

    # Khóa bảo mật ký token JWT (Dùng để xác thực)
    JWT_SECRET=your_jwt_secret_key_here
    JWT_EXPIRES_IN=7d

    # Cấu hình gửi mail OTP (Gmail SMTP)
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password

    # Thời gian hết hạn của OTP (phút)
    OTP_EXPIRE_MINUTES=5
    ```

> [!NOTE]
> Backend mặc định chạy trên cổng `5000`. Frontend đã được cấu hình proxy tự động chuyển tiếp các truy vấn `/api` sang cổng `5000` này, do đó bạn không cần thay đổi cấu hình kết nối mạng của frontend.

---

## 📦 BƯỚC 2: CÀI ĐẶT THƯ VIỆN (INSTALL DEPENDENCIES)

Dự án bao gồm 2 phần độc lập, bạn cần cài đặt thư viện cho từng thư mục:

1.  **Cài đặt thư viện cho Backend:**
    ```bash
    cd backend
    npm install
    ```
2.  **Cài đặt thư viện cho Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```

---

## 🗄️ BƯỚC 3: KHỞI TẠO DỮ LIỆU MẪU (SEED DATA)

Để khởi tạo danh mục theo các hãng máy ảnh danh tiếng (Canon, Nikon, Fujifilm, Sony, ...) và chia sản phẩm máy ảnh tự động từ thư mục sản phẩm vào đúng danh mục, hãy chạy lệnh seed dữ liệu:

1.  Mở Terminal mới và di chuyển vào thư mục **`backend/`**:
    ```bash
    cd backend
    ```
2.  Chạy lệnh seed dữ liệu:
    ```bash
    npm run seed
    ```
    *Lệnh này sẽ chạy kịch bản tự động để:*
    *   Tạo danh mục theo các hãng từ thư mục sản phẩm.
    *   Đọc, phân loại sản phẩm máy ảnh mẫu và lưu vào cơ sở dữ liệu.
    *   Tạo người dùng mẫu và các mã giảm giá mặc định.

---

## 🚀 BƯỚC 4: KHỞI CHẠY ỨNG DỤNG (RUN DEVELOPMENT SERVERS)

Bạn cần khởi chạy đồng thời cả Backend Server và Frontend Client từ hai terminal riêng biệt:

### 1. Khởi chạy Backend Server:
1.  Mở Terminal thứ nhất, di chuyển vào thư mục **`backend/`** và chạy lệnh:
    ```bash
    cd backend
    npm run dev
    ```
2.  Khi khởi chạy và kết nối Database thành công, bạn sẽ thấy thông báo:
    ```text
    🚀 Server running on port 5000
    🌿 MongoDB connected successfully: uteshop_db_caNhan
    ```

### 2. Khởi chạy Frontend Client (Vite):
1.  Mở Terminal thứ hai, di chuyển vào thư mục **`frontend/`** và chạy lệnh:
    ```bash
    cd frontend
    npm run dev
    ```
2.  Vite Client sẽ khởi chạy và cung cấp liên kết truy cập cục bộ (thường là `http://localhost:5173` hoặc `http://localhost:5174`). Mở trình duyệt và truy cập để trải nghiệm sản phẩm.

---

## 🧪 TRẢI NGHIỆM CÁC TÍNH NĂNG CHÍNH

### 1. Đăng nhập / Đăng ký & Nhận OTP qua email
*   Hệ thống hỗ trợ gửi mã xác thực đăng ký hoặc đặt lại mật khẩu qua email thật đã cấu hình ở bước `.env`.
*   Hoặc sử dụng tài khoản kiểm thử mặc định đã tạo trong lúc chạy Seed Data.

### 2. Xem sản phẩm và Mua sắm
*   Khám phá các thương hiệu máy ảnh đẳng cấp với giao diện chữ nhật ngang bo góc mềm mại, cao cấp.
*   Trang danh mục và chi tiết sản phẩm được thiết kế với chuẩn tiền tệ VND và các hình ảnh camera sắc nét từ bộ sản phẩm của hãng.

### 3. Theo dõi & Hủy đơn hàng (Theo yêu cầu số 3)
*   Thực hiện mua sản phẩm và thanh toán bằng phương thức COD.
*   Truy cập **Lịch sử mua hàng** (`/orders`) hoặc **Chi tiết đơn hàng** (`/orders/:id`) để xem Timeline trạng thái động.
*   **Trải nghiệm quy luật thời gian thực:**
    1.  *Trong vòng 30 phút đầu sau khi đặt đơn:* Bạn có thể bấm nút **Hủy đơn** ở trạng thái `Đang chờ` (pending) hoặc `Đã xác nhận` (confirmed) để hủy trực tiếp.
    2.  *Nếu quá 30 phút:* Backend sẽ tự động kích hoạt chế độ **Auto-Confirm** chuyển sang trạng thái `Đã xác nhận` (khi bạn xem trang đơn hàng), lúc này bạn không thể tự ý hủy đơn trực tiếp nữa (hệ thống sẽ hiển thị lỗi cảnh báo đỏ).
    3.  *Trường hợp shop đang chuẩn bị hàng (Step 3: preparing):* Nút bấm sẽ tự chuyển thành **"Gửi yêu cầu hủy"**. Bấm vào nút này sẽ gửi yêu cầu duyệt hủy lên shop (`cancel_requested`) thay vì hủy lập tức.
