# Payment service

# Mục đích

- Free 100%

- Open source, self host, sử dụng api gốc của ngân hàng.

- Bảo mật thông tin giao dịch và thông tin đăng nhập ngân hàng.

- Thông báo qua telegram, discord.

- Gửi webhook để các service khác cộng số dư cho user.

- API danh sách giao dịch.

- Không giới hạn số lượng giao dịch.

- Cài đặt đơn giản: sửa file config, chạy lệnh docker-compose up.

- Source có khả năng thêm các cổng thanh toán tuỳ chỉnh dễ dàng.

- Sử dụng bullmq đảm bảo webhook, thông báo được gửi đi.

- Ngân hàng hỗ trợ: Mb Bank, Tp Bank, Acb Bank.

![image info](./docs/a.png)

# Cài đặt

## Hỗ trợ

- Docker in Ubuntu
- Docker in window (wsl2)
- NOT support Docker in mac os (need someone to fix it)
- Other os: (no test yet)

## Cài đặt cơ bản

1. Cài đặt docker và docker-compose trên máy chủ

[https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)

[https://docs.docker.com/desktop/install/windows-install/](https://docs.docker.com/desktop/install/windows-install/)

[https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)



2. Cấu trúc thư mục

```javascript

├── .docker/
│   └── config/
│       └── config.yml
├── docker-compose.yml
└── .env
```

  Lỗi đã biết:

- Có thể báo lỗi không có quyền đọc file config.yml, vui lòng cấp quyền đọc



3. Tạo file `.env`

```javascript
PORT=3000
```

4. Tạo file `docker-compose.yml`

```javascript
version: '3'
volumes:
  redis-data:
    driver: local
services:
  app:
    image: registry.gitlab.com/nhayhoc/payment-service
    volumes:
      - ./.docker/config/config.yml:/app/config/config.yml
    ports:
      - ${PORT}:${PORT}
    depends_on:
      - redis
      - captcha-resolver
    environment:
      - PORT=${PORT}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - CAPTCHA_API_BASE_URL=http://captcha-resolver:1234
  redis:
    image: redis:6.2-alpine
    volumes:
      - redis-data:/data
  captcha-resolver:
    image: registry.gitlab.com/nhayhoc/bank-captcha-server
```

5. Tạo file `.docker/config/config.yml`

```javascript
bots:
  notification_telegram_bot:
    type: "TELEGRAM"
    token: "bot token"
    chat_chanel_id: "chat id"
    conditions:
      content_regex: ".*?"
      account_regex: ".*?"
    # only support in telegram
    # admin_ids can use /stopCron command
    admin_ids:
      - "6862724379"
  notification_discord_bot:
    type: "DISCORD"
    token: ""
    chat_chanel_id: ""
    conditions:
      content_regex: ".*?"
      account_regex: ".*?"
webhooks:
  test_webhook:
    url: "http://192.168.1.102:3001/api/payment/callback"
    token: "tokenafjldskjfklads"
    conditions:
      content_regex: ".*?"
      account_regex: ".*?"

gateways:
  mb_bank_1:
    type: "MBBANK"
    password: "bank password" 
    account: "stk nhan tien"
    login_id: "ten dang nhap bank"
    repeat_interval_in_sec: 20
  # abc_bank_1:
  #   type: 'ACBBANK'
  #   password: '--'
  #   account: '123'
  #   login_id: 'abc'
  #   repeat_interval_in_sec: 10

```

Giải thích:

- `conditions.content_regex` là regex nội dung giao dịch, nếu khớp thì thông báo/webhook mới được gửi đi. Ví dụ`ct /d+` khi nội dung giao dịch có dạng `ct 1342343` service sẽ gửi thông báo, khi nội dung giao dịch có dạng `kw 432423` service sẽ không gửi thông báo.
- ``conditions.account_regex` tương tự, là regex số tài khoản nhận tiền.
- `gateways`
    - `mb_bank_1` là tên gateway, đặt tuỳ ý
    - `type` có `MBBANK` | `ACBBANK` | `TPBANK`
    - `password` pass login bank
    - `account` stk nhận tiền
    - `login_id` user đăng nhập bank
    - `repeat_interval_in_sec` thời gian polling lịch sử

6. Chạy lệnh `docker-compose up -d`

NOTE: 
- Hãy đảm bảo **đúng thông tin đăng nhập** trước khi nhập vào service, tránh service spam dẫn tới bị khoá IP/account
- Vào cài đặt ngân hàng tương ứng, tìm **tắt 2fa**.

[https://online.mbbank.com.vn/pl/login](https://online.mbbank.com.vn/pl/login)

[https://acb.com.vn/](https://acb.com.vn/)

[https://ebank.tpb.vn/retail/vX/](https://ebank.tpb.vn/retail/vX/)



## Bot telegram

### **Step 1 - Tạo Telegram Bot**

Tạo bot mới với [BotFather](https://t.me/BotFather) và copy token

### **Step 2 - Lấy chat id**

Dùng [Message Tool](https://irgendwr.github.io/TelegramAlert/message-tool) để tìm chatid của mình![](https://wfb4kugxtf8.sg.larksuite.com/space/api/box/stream/download/asynccode/?code=YWIzYmVhOTU3ZjI4NTU1YTg1ODMwN2JkMmZhMzJhZmFfM0RHaGlzMEJjd2NudjhSeGIzQXUwdmZnQThXa3pwMHNfVG9rZW46U3d1VmJYbXRpb1A2Mkt4ZDZ2amxHVWduZ3Z4XzE3MTAzMTA2MjQ6MTcxMDMxNDIyNF9WNA)

NOTE: Nếu muốn bot gửi tin nhắn vào group, hãy tắt privacy mode, và thêm bot vào group, cho phép bot có quyền gửi tin nhắn.

### Step 3 - Cài đặt

```javascript
notification_telegram_bot:
    type: "TELEGRAM"
    token: "" # thay bằng token ở step 1
    chat_chanel_id: "" # thay bằng chat id ở step 2
    conditions:
      content_regex: ".*?"
      account_regex: ".*?"
    # only support in telegram
    # admin_ids can use /stopCron command
    admin_ids:
      - "6862724379" # thay bằng user id ở step 2
```

`conditions.content_regex` và `conditions.account_regex` đã nói ở mục đầu.

### Stop

Trong trường hợp bạn cần đăng nhập vào bank trên đt, mà payment-service cũng đăng nhập vào khiến bạn bị văng ra, thì hãy chat như sau với con bot tele, nó sẽ dừng 5p cho bạn có time chuyển tiền đi.![](https://wfb4kugxtf8.sg.larksuite.com/space/api/box/stream/download/asynccode/?code=NDI3YTMyYTE2MDYxNjAzMGVhZDdlZjRhOGIwMWUyZTlfc0V4TExLYTNudFZISFpIRDc5Ymc0d2FUODU2dzlwcEFfVG9rZW46RXg0M2J5a3JKb2V4RVp4TUNpOWx2VWU5Z1ZmXzE3MTAzMTA2MjQ6MTcxMDMxNDIyNF9WNA)Hoặc call api như sau

```javascript
http://localhost:3000/payments/stop-gate?name=mb_bank_1&time_in_sec=600
```

## Bot discord

Vào kênh cần nhận thông báo, tạo webhook, bấm sao chép url webhook![](https://wfb4kugxtf8.sg.larksuite.com/space/api/box/stream/download/asynccode/?code=NmRhYzJmMDgyMmUyNWQ2MzdkZjljN2VjYjhiM2U4ZGNfSTNtaEowUElZTm5CSXlCU0QzREplb0dGYmN6Q3dMUmVfVG9rZW46SVhPTmJQNThqb0VwQ3Z4NElPb2w4NWl6Z2FkXzE3MTAzMTA2MjQ6MTcxMDMxNDIyNF9WNA)

```javascript
https://discord.com/api/webhooks/1189585904591982673/7kM-0WURzVYkf5Tv2Rs1Un1rfMDWIHwsVNCC6YTvkK-P1XhTc_nf3Xcw0URf8Ynsbmd9
```

==> từ URL vừa copy trên discord, ta lấy được chatid và token.

Chatid: `1189594424070639667`

Token: ``

```javascript
notification_discord_bot:
    type: "DISCORD"
    token: ""
    chat_chanel_id: "1189585904591982673"
    conditions:
      content_regex: ".*?"
      account_regex: ".*?"
```

## Webhook cho web của bạn

```javascript
test_webhook:
    url: "http://192.168.1.102:3001/api/payment/callback"
    token: "tokenafjldskjfklads"
    conditions:
      content_regex: ".*?"
      account_regex: ".*?"
```

Khi có giao dịch mới bạn sẽ nhận được như sau![](https://wfb4kugxtf8.sg.larksuite.com/space/api/box/stream/download/asynccode/?code=ZTU1ZmQ3M2UzNTUzZDRiZjNiODU2NThmYWExODJkMzFfOFJpd015aUU2QTNjWkkxVzlLa2FjclEzNk55cXl2dDNfVG9rZW46QmhGNmJNMDBub0lzTVh4Sk1Xd2xkdG93Z0RoXzE3MTAzMTA2MjQ6MTcxMDMxNDIyNF9WNA)Mình để code web nhận ví dụ bạn có thể copy về test nhé

```javascript
// ví dụ đây là web của bạn
const express = require("express");
const app = express();

// Middleware to parse JSON data
app.use(express.json());

// Handling POST request to '/api/data'
app.post("/api/payment/callback", (req, res) => {
  const data = req.body; // Accessing data sent in the POST request
  console.log(data); // Logging the data to the console

  // Send a response back to the client
  res.status(200).send("Data received");
});

// Set the server to listen on port 3000
app.listen(3001, () => {
  console.log("Server running on port 3001");
});

```

## API

`http://localhost:3000/payments`![](https://wfb4kugxtf8.sg.larksuite.com/space/api/box/stream/download/asynccode/?code=OTc5OTVhMzk4YjM1MjM3NWRlMTI2NTcxMmIyZDU1NjdfYmNURE1vY3dibWpGd2NKTWloMTFucGJIZWQxME9vaHhfVG9rZW46RkpyTWJrdDdtb3dITE54aG5USWxjQzVTZ0FwXzE3MTAzMTA2MjQ6MTcxMDMxNDIyNF9WNA)

## Nếu vps bạn yếu, có thể dùng server giải captcha free của bên mình

~~[https://bank-captcha.ducmaster.com](https://bank-captcha.ducmaster.com)~~ (đã di chuyển)

Từ ngày 24/2/2024, server sẽ chuyển sang [bank-captcha.payment.com.vn](http://bank-captcha.payment.com.vn)

Từ ngày 30/3/2024, bank-captcha.ducmaster.com sẽ dừng hoạt động

(vui lòng ko spam, ddos nhé :v)


```javascript
# docker-compose.yml
version: '3'
volumes:
  redis-data:
    driver: local
services:
  app:
    image: registry.gitlab.com/nhayhoc/payment-service
    volumes:
      - ./config/config.yml:/app/config/config.yml
    ports:
      - ${PORT}:${PORT}
    depends_on:
      - redis
      - captcha-resolver
    environment:
      - PORT=${PORT}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - CAPTCHA_API_BASE_URL=https://bank-captcha.payment.com.vn
  redis:
    image: redis:6.2-alpine
    volumes:
      - redis-data:/data
 #Bạn không cần service giải captcha nữa ^^
  #captcha-resolver:
  #  image: registry.gitlab.com/nhayhoc/bank-captcha-server
```

Group mình mới lập, chia sẻ kiến thức làm web indie
[https://www.facebook.com/groups/1798425277237936](https://www.facebook.com/groups/1798425277237936)

## Mở rộng

- Thêm bất cứ loại giao dịch hay cổng thanh toán nào, emit event `payment.history-updated`
- Lắng nghe có giao dịch mới, `@OnEvent("payment.created")`

## Hướng dẫn đóng góp
### Chạy dự án
Khởi chạy redis và server giải captcha

`docker-compose -f docker-compose.dev.yml up -d`

Install package
`pnpm install`

Tạo file .env
```
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6380
CAPTCHA_API_BASE_URL=http://localhost:1234
```
Tạo file `config/config.yml`
```yml
bots:
webhooks:
gateways:
  your_bank_1:
    type: 'YOUR_TYPE'
    password: '--'
    login_id: '--'
    account: '--'
    repeat_interval_in_sec: 20
```
Chạy `pnpm run start:dev`

Lưu ý, các lịch sử giao dịch cũ sẽ được cache trong redis, để xoá chúng hãy làm bước sau:
- Tắt app
- Chạy lệnh `docker-compose exec redis redis-cli flushall`
- Mở lại app

### Thêm cổng thanh toán
- Tạo thêm file mới `/gateways/gateway-factory/yourgateway.services.ts`

```ts
+ import { GateType, Payment } from '../gate.interface';
+ import { Gate } from '../gates.services';
+ 
+ export class YourGatewayService extends Gate {
+   async getHistory(): Promise<Payment[]> {
+     // your code here
+     return ...
+   }
+ }
```

- Sửa `src\gateways\gate.interface.ts`
```ts
export enum GateType {
   MBBANK = 'MBBANK',
+  YOUR_TYPE = 'YOUR_TYPE'
}
```
- Sửa factory gateway `src/gateways/gateway-factory/gate.factory.ts`
```ts

    switch (config.type) {
+      case GateType.YOUR_TYPE:
+        const yourbank = new YourGatewayService(config, eventEmitter, captchaSolver);
+        return yourbank;
```
- Cập nhật validate `src/gateways/gates-manager.services.ts`
```ts
      login_id: Joi.string().when('type', {
-       is: [GateType.ACBBANK, GateType.MBBANK, GateType.TPBANK],
+       is: [GateType.ACBBANK, GateType.MBBANK, GateType.YOUR_TYPE],
        then: Joi.required(),
      }),
```

# Bản quyền

- Mã nguồn của dịch vụ này được công khai, cho phép bất kỳ ai xem, sửa đổi, và cải thiện nó.
- Được phép sử dụng vào mục đích thương mại: tạo cổng thanh toán cho website, thông báo giao dịch cho nhân viện của hàng,...
- Không sử dụng thương mại: mở các dịch vụ tương tự Casso.vn

# Miễn trừ trách nhiệm

- **Miễn Trừ Trách Nhiệm Pháp Lý**: Người phát triển mã nguồn không chịu trách nhiệm pháp lý cho bất kỳ thiệt hại hay tổn thất nào xuất phát từ việc sử dụng hoặc không thể sử dụng dịch vụ.

- **Sử Dụng API Ngân Hàng Không Chính Thức**: Dịch vụ này hiện đang sử dụng các API của ngân hàng mà không có sự đồng ý chính thức từ các ngân hàng hoặc tổ chức tài chính liên quan. Do đó, người sáng lập và nhóm phát triển:
  - Không chịu trách nhiệm cho bất kỳ vấn đề pháp lý hoặc hậu quả nào phát sinh từ việc sử dụng các API này.
  - Không đảm bảo tính chính xác, độ tin cậy, hoặc tính sẵn có của dữ liệu lấy từ các API này.
  - Khuyến cáo người dùng cần cân nhắc rủi ro pháp lý và an toàn thông tin khi sử dụng dịch vụ.

**Ghi Chú Quan Trọng:**

- Việc sử dụng các API không chính thức này có thể vi phạm các quy định pháp lý và chính sách của ngân hàng.
- Chúng tôi khuyến khích người dùng và các bên liên quan cân nhắc kỹ lưỡng trước khi sử dụng dịch vụ này cho các mục đích tài chính hoặc thanh toán quan trọng.
- Người dùng nên tham khảo ý kiến từ chuyên gia pháp lý hoặc tài chính trước khi đưa ra quyết định dựa trên dữ liệu hoặc dịch vụ được cung cấp qua dịch vụ này.

# Những Người Đóng Góp

Dự án này không thể tồn tại mà không có sự hỗ trợ và cống hiến của cộng đồng. Xin chân thành cảm ơn tất cả những người đã đóng góp vào việc phát triển và cải thiện mã nguồn này.

[@ducmaster](https://gitlab.com/nhayhoc) - Bot (Discord, Telegram), Webhook, Mb bank, Acb bank

[@chuanghiduoc](https://gitlab.com/chuanghiduoc) - Thêm cổng Tp bank

[@TypicalShavonne](https://gitlab.com/TypicalShavonne) - Chỉnh sửa thông báo discord embed
