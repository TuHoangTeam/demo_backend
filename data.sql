INSERT INTO "category" (
  id, 
  name, 
  name_en, 
  icon, 
  color, 
  avg_co2per_kg, 
  status, 
  created_at, 
  updated_at
)
VALUES 
  (gen_random_uuid(), 'Đồ điện tử', 'Electronics', 'smartphone', '#FF5733', 25.5, 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Thời trang', 'Fashion', 'checkroom', '#33FF57', 15.2, 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Đồ gia dụng', 'Furniture', 'chair', '#3357FF', 10.0, 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Sách vở', 'Books', 'menu_book', '#F1C40F', 1.5, 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Mỹ phẩm', 'Beauty', 'brush', '#E91E63', 5.8, 'ACTIVE', NOW(), NOW())
RETURNING id, name;


INSERT INTO "achievement" (
  id, 
  name, 
  description, 
  icon, 
  type, 
  requirement, 
  reward_points, 
  status, 
  created_at, 
  updated_at
)
VALUES 
  -- 1. Nhóm ITEMS_GIVEN (Cho đồ)
  (gen_random_uuid(), 'Người khởi xướng', 'Trao tặng món đồ đầu tiên thành công', 'volunteer_activism', 'ITEMS_GIVEN', 1, 10, 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Tấm lòng vàng', 'Trao tặng thành công 10 món đồ', 'handshake', 'ITEMS_GIVEN', 10, 100, 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Nhà từ thiện', 'Trao tặng thành công 50 món đồ', 'diversity_1', 'ITEMS_GIVEN', 50, 500, 'ACTIVE', NOW(), NOW()),

  -- 2. Nhóm CO2_SAVED (Bảo vệ môi trường)
  (gen_random_uuid(), 'Sống Xanh nhập môn', 'Tiết kiệm được 10kg CO2 từ việc tái sử dụng', 'eco', 'CO2_SAVED', 10, 20, 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Chiến binh Môi trường', 'Tiết kiệm được 100kg CO2', 'forest', 'CO2_SAVED', 100, 200, 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Đại sứ Trái Đất', 'Tiết kiệm được 1000kg CO2', 'public', 'CO2_SAVED', 1000, 2000, 'ACTIVE', NOW(), NOW()),

  -- 3. Nhóm ITEMS_RECEIVED (Nhận đồ / Tái sử dụng)
  (gen_random_uuid(), 'Vòng đời mới', 'Nhận món đồ cũ đầu tiên', 'recycling', 'ITEMS_RECEIVED', 1, 10, 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Người tiết kiệm', 'Nhận thành công 20 món đồ', 'inventory_2', 'ITEMS_RECEIVED', 20, 150, 'ACTIVE', NOW(), NOW()),

  -- 4. Nhóm RATING (Uy tín)
  (gen_random_uuid(), 'Được yêu thích', 'Đạt 10 đánh giá 5 sao', 'star', 'RATING', 10, 50, 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Siêu uy tín', 'Đạt 50 đánh giá 5 sao', 'verified', 'RATING', 50, 300, 'ACTIVE', NOW(), NOW()),

  -- 5. Nhóm STREAK (Điểm danh/Chăm chỉ)
  (gen_random_uuid(), 'Khách quen', 'Đăng nhập 7 ngày liên tiếp', 'calendar_month', 'STREAK', 7, 30, 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Fan cứng', 'Đăng nhập 30 ngày liên tiếp', 'local_fire_department', 'STREAK', 30, 150, 'ACTIVE', NOW(), NOW())
  
RETURNING id, name, type;