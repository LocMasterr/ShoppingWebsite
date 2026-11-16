  /**
 * =========================================================
 * TRUNG TÂM DỮ LIỆU GAY TECH STORE (js/products.js)
 * =========================================================
 * Bạn chỉ cần sửa file này khi muốn:
 * 1. Thêm / sửa danh mục ở mảng CATEGORIES_DATA
 * 2. Thêm / sửa sản phẩm, giá tiền, ảnh ở mảng PRODUCTS_DATA
 * 3. Cập nhật Tên, MSSV, Vai trò của 5 thành viên ở mảng TEAM_MEMBERS_DATA
 */

const CATEGORIES_DATA = [
  {
    id: "Gaming Mouse",
    title: "Gaming Mouse",
    subtitle: "Chuột không dây",
    image: "img/chuot.jpg"
  },
  {
    id: "Mechanical Keyboard",
    title: "Mechanical Keyboard",
    subtitle: "Bàn phím cơ 75%",
    image: "img/phim.jpg"
  },
  {
    id: "Gaming Headset",
    title: "Gaming Headset",
    subtitle: "Tai nghe chụp tai",
    image: "img/taiNghe.png"
  },
  {
    id: "Monitor",
    title: "Monitor",
    subtitle: "Màn hình 146Hz",
    image: "img/manHinh.jpg"
  },
  {
    id: "Mousepad",
    title: "Mousepad",
    subtitle: "Bàn di chuột",
    image: "img/lotChuot.jpg"
  },
  {
    id: "Game Controller",
    title: "Game Controller",
    subtitle: "Tay cầm DualSense",
    image: "img/tayCam.png"
  }
];

const PRODUCTS_DATA = [
  {
    id: "gts-mouse-g305",
    name: "Logitech G305 X Lightspeed White",
    category: "Gaming Mouse",
    categoryLabel: "Chuột Gaming",
    price: 1050000,
    image: "img/chuot.jpg",
    badge: "ĐƯỢC QUAN TÂM",
    shortDesc: "Chuột gaming không dây thiết kế gọn gàng, hiện đại, phù hợp cho góc học tập và giải trí mỗi ngày.",
    description: "Logitech G305 X Lightspeed White là mẫu chuột gaming không dây mang phong cách tối giản, giúp góc máy của sinh viên luôn gọn gàng, không vướng dây cáp. Thiết kế công thái học đối xứng giúp cầm nắm thoải mái khi làm bài tập dài giờ lẫn giải trí cuối tuần.",
    highlights: [
      "Kết nối không dây tiện lợi, tối ưu không gian bàn học",
      "Tông màu trắng hiện đại, dễ phối với nhiều góc setup",
      "Phù hợp cho cả nhu cầu học tập, làm việc và chơi game"
    ]
  },
  {
    id: "gts-pad-gigantus",
    name: "Razer Gigantus V2 Medium",
    category: "Mousepad",
    categoryLabel: "Lót Chuột",
    price: 490000,
    image: "img/lotChuot.jpg",
    badge: "GỢI Ý SINH VIÊN",
    shortDesc: "Bàn di chuột bề mặt vải dệt mịn, tạo không gian di chuột ổn định và hoàn thiện góc gaming.",
    description: "Razer Gigantus V2 Medium mang lại bề mặt di chuột chuyên dụng, giúp các thao tác rê chuột mượt mà và chính xác hơn so với mặt bàn thông thường. Kích thước Medium vừa vặn với bàn học tại ký túc xá hoặc phòng trọ sinh viên.",
    highlights: [
      "Bề mặt tối ưu cho thao tác di chuột ổn định, mượt mà",
      "Đế cao su hạn chế xê dịch khi sử dụng cường độ cao",
      "Kích thước Medium gọn gàng, vừa vặn bàn học sinh viên"
    ]
  },
  {
    id: "gts-monitor-vg249",
    name: "ASUS TUF Gaming VG249QE5A 24-inch",
    category: "Monitor",
    categoryLabel: "Màn Hình",
    price: 2590000,
    image: "img/manHinh.jpg",
    badge: "NỔI BẬT",
    shortDesc: "Màn hình gaming 24-inch tần số quét 146Hz phục vụ tốt nhu cầu giải trí, chơi game và học tập.",
    description: "ASUS TUF Gaming VG249QE5A 24-inch sở hữu tần số quét 146Hz mang lại chuyển động hình ảnh mượt mà khi chơi game và giải trí. Không gian hiển thị 24-inch rộng rãi giúp sinh viên dễ dàng chia đôi cửa sổ để vừa tra cứu tài liệu, lập trình vừa theo dõi bài giảng.",
    highlights: [
      "Kích thước 24-inch tiêu chuẩn cho góc học tập và giải trí",
      "Tần số quét 146Hz hiển thị chuyển động mượt mà",
      "Thiết kế cứng cáp, tối ưu cho nhu cầu sử dụng máy tính hằng ngày"
    ]
  },
  {
    id: "gts-kb-dareu-flex75",
    name: "DareU Flex 75 Wireless Mechanical Keyboard",
    category: "Mechanical Keyboard",
    categoryLabel: "Bàn Phím Cơ",
    price: 850000,
    image: "img/phim.jpg",
    badge: "BÁN CHẠY",
    shortDesc: "Bàn phím cơ không dây layout 75% nhỏ gọn, nâng cấp cảm giác gõ khi học tập, code và chơi game.",
    description: "DareU Flex 75 Wireless Mechanical Keyboard là lựa chọn hợp túi tiền cho sinh viên muốn nâng cấp từ bàn phím thường lên bàn phím cơ. Bố cục 75% giữ lại cụm phím điều hướng cần thiết khi soạn thảo và lập trình nhưng vẫn tiết kiệm diện tích mặt bàn.",
    highlights: [
      "Layout 75% nhỏ gọn, đầy đủ hàng phím chức năng và mũi tên",
      "Hỗ trợ kết nối không dây giúp góc bàn học luôn ngăn nắp",
      "Cảm giác gõ cơ học rõ ràng, phù hợp gõ văn bản và chơi game"
    ]
  },
  {
    id: "gts-headset-vh160",
    name: "Rapoo VH160 Gaming Headset",
    category: "Gaming Headset",
    categoryLabel: "Tai Nghe Gaming",
    price: 690000,
    image: "img/taiNghe.png",
    badge: "GIÁ TỐT",
    shortDesc: "Tai nghe chụp tai phục vụ trọn vẹn nhu cầu chơi game, nghe nhạc và học nhóm trực tuyến.",
    description: "Rapoo VH160 Gaming Headset đáp ứng đồng thời nhu cầu giải trí và học tập trực tuyến của sinh viên. Thiết kế chụp tai êm ái kết hợp micro tích hợp giúp giao tiếp rõ ràng trong các buổi họp nhóm qua Zoom, Discord hoặc khi phối hợp cùng đồng đội trong game.",
    highlights: [
      "Thiết kế chụp tai hỗ trợ tập trung khi học tập và giải trí",
      "Tích hợp micro thuận tiện cho học online và đàm thoại",
      "Mức giá dễ tiếp cận với ngân sách sinh viên"
    ]
  },
  {
    id: "gts-pad-dualsense",
    name: "PlayStation 5 DualSense Controller",
    category: "Game Controller",
    categoryLabel: "Tay Cầm Chơi Game",
    price: 1535000,
    image: "img/tayCam.png",
    badge: "ĐƯỢC QUAN TÂM",
    shortDesc: "Tay cầm chơi game thiết kế hiện đại, mang lại trải nghiệm giải trí sống động và thoải mái.",
    description: "PlayStation 5 DualSense Controller là phụ kiện giải trí dành cho các bạn yêu thích các tựa game thể thao, hành động và phiêu lưu. Thiết kế báng cầm ôm tay giúp thư giãn thoải mái sau những giờ học tập và thi cử căng thẳng.",
    highlights: [
      "Thiết kế công thái học hiện đại, cầm nắm chắc chắn",
      "Bố cục nút bấm trực quan, phản hồi nhạy bén",
      "Phụ kiện lý tưởng cho nhu cầu giải trí sau giờ học"
    ]
  }
];

const TEAM_MEMBERS_DATA = [
  {
    avatarText: "Trưởng Nhóm",
    name: "Kiều Gia Huy",
    mssv: "26127170",
    role: "Kiến trúc mã nguồn, Lập trình tính năng & Kiểm thử hệ thống"
  },
  {
    avatarText: "TV2",
    name: "Lê Trần Tấn Lộc",
    mssv: "26127258",
    role: "Thiết kế giao diện UI/UX & Tối ưu hiển thị di động"
  },
  {
    avatarText: "TV3",
    name: "Thành viên 3",
    mssv: "[Cập nhật MSSV]",
    role: "Xây dựng dữ liệu sản phẩm & Nội dung thương hiệu"
  },
  {
    avatarText: "TV4",
    name: "Thành viên 4",
    mssv: "[Cập nhật MSSV]",
    role: "Thiết kế Poster khổ A1, mã QR & Kịch bản thuyết trình"
  },
  {
    avatarText: "TV5",
    name: "Thành viên 5",
    mssv: "[Cập nhật MSSV]",
    role: "Phụ trách luồng Giỏ hàng, Thanh toán & Điều phối nhóm"
  }
];
