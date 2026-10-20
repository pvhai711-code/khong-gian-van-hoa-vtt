-- ============================================================
-- DỮ LIỆU BÀI VIẾT MẪU — Không gian văn hóa Hồ Chí Minh
-- Chạy file này trong Supabase > SQL Editor SAU KHI đã chạy
-- supabase-schema.sql, để website không bị trống khi mới đăng.
-- Nội dung là các bài mẫu lấy từ bản thiết kế đã duyệt (nguồn
-- ghi Hochiminhcity.gov.vn như trang mẫu). Admin có thể sửa/xóa
-- và đăng bài thật của trường bất cứ lúc nào.
-- Chạy lại nhiều lần không tạo trùng (bỏ qua slug đã tồn tại).
-- ============================================================

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Hội nghị toàn quốc quán triệt, triển khai thực hiện một số nghị quyết, chỉ thị của Bộ Chính trị',
  'hoi-nghi-toan-quoc-quan-triet-nghi-quyet-bo-chinh-tri',
  '(Hochiminhcity.gov.vn) - Sáng 03/9, Bộ Chính trị, Ban Bí thư tổ chức Hội nghị toàn quốc nghiên cứu, học tập, quán triệt và triển khai thực hiện một số nghị quyết, chỉ thị của Bộ Chính trị.',
  '<p>Sáng 03/9, Bộ Chính trị, Ban Bí thư tổ chức Hội nghị toàn quốc nghiên cứu, học tập, quán triệt và triển khai thực hiện một số nghị quyết, chỉ thị của Bộ Chính trị.</p><p>Hội nghị được tổ chức trực tiếp kết hợp trực tuyến tới các điểm cầu trong cả nước, với sự tham dự của lãnh đạo các ban, bộ, ngành, địa phương. Đây là đợt sinh hoạt chính trị sâu rộng nhằm thống nhất nhận thức và hành động trong toàn Đảng, toàn hệ thống chính trị.</p><p>Các đại biểu nghe quán triệt những nội dung cốt lõi, điểm mới của các nghị quyết, chỉ thị; thảo luận chương trình hành động cụ thể gắn với nhiệm vụ của từng cơ quan, đơn vị, địa phương trong giai đoạn phát triển mới của đất nước.</p>',
  'published', 1520, '2026-09-03T10:45:00+07', '2026-09-03T10:45:00+07'
from public.categories c where c.slug = 'tin-tuc-khong-gian-van-hoa'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Nhận thức sâu sắc và thực hành tốt nhất theo di huấn của Bác Hồ',
  'nhan-thuc-sau-sac-va-thuc-hanh-tot-nhat-theo-di-huan-cua-bac-ho',
  'Chủ tịch Hồ Chí Minh bắt đầu viết Di chúc từ ngày 10/5/1965. Bản thảo Di chúc đầu tiên được Bác coi là tài liệu tuyệt mật...',
  '<p>Chủ tịch Hồ Chí Minh bắt đầu viết Di chúc từ ngày 10/5/1965. Bản thảo Di chúc đầu tiên được Bác coi là tài liệu "tuyệt mật", ghi rõ: "phòng khi tôi sẽ đi gặp cụ Các Mác, cụ Lê-nin và các vị cách mạng đàn anh khác, thì đồng bào cả nước, đồng chí trong Đảng và bầu bạn khắp nơi đều khỏi cảm thấy đột ngột".</p><p>Trong những năm tiếp theo, mỗi dịp sinh nhật, Người lại dành thời gian bổ sung, sửa chữa bản Di chúc. Đến tháng 5/1969, bản Di chúc hoàn chỉnh thể hiện trọn vẹn tâm nguyện, tình cảm và ý chí của Người đối với Đảng, với Nhân dân và phong trào cách mạng thế giới.</p><p>Học tập di huấn của Bác không chỉ là đọc thuộc từng câu chữ, mà quan trọng hơn là biến nhận thức thành hành động: mỗi cán bộ, đảng viên, giáo viên và học sinh thực hành tốt nhất những điều Bác dặn trong công việc và đời sống hằng ngày.</p>',
  'published', 2310, '2026-09-04T14:09:00+07', '2026-09-04T14:09:00+07'
from public.categories c where c.slug = 'tin-tuc-khong-gian-van-hoa'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Không gian văn hóa Hồ Chí Minh trong nhịp sống hôm nay',
  'khong-gian-van-hoa-ho-chi-minh-trong-nhip-song-hom-nay',
  'Sau 5 năm xây dựng, Không gian văn hóa Hồ Chí Minh tại Thành phố mang tên Người đã được mở rộng đến từng khu dân cư, trường học, doanh nghiệp...',
  '<p>Sau 5 năm xây dựng, Không gian văn hóa Hồ Chí Minh tại Thành phố mang tên Người đã được mở rộng đến từng khu dân cư, trường học, doanh nghiệp, trở thành điểm đến gần gũi trong đời sống tinh thần của người dân.</p><p>Ở các trường học, Không gian văn hóa Hồ Chí Minh là nơi học sinh tìm hiểu về cuộc đời, sự nghiệp của Bác qua sách, hình ảnh, tư liệu và các hoạt động trải nghiệm. Nhiều mô hình hay như "góc học tập theo Bác", "mỗi tuần một câu chuyện về Bác" đã đi vào nề nếp.</p><p>Việc xây dựng Không gian văn hóa không dừng ở hình thức trưng bày, mà hướng tới mục tiêu lớn hơn: để tư tưởng, đạo đức, phong cách Hồ Chí Minh thấm sâu vào từng việc làm cụ thể mỗi ngày.</p>',
  'published', 2745, '2026-09-04T11:54:00+07', '2026-09-04T11:54:00+07'
from public.categories c where c.slug = 'tin-tuc-khong-gian-van-hoa'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Tuyên ngôn Độc lập - ngọn đuốc soi đường cho dân tộc Việt Nam',
  'tuyen-ngon-doc-lap-ngon-duoc-soi-duong-cho-dan-toc-viet-nam',
  'Ngày 2/9/1945, tại Quảng trường Ba Đình, Hà Nội, Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập, tuyên bố sự ra đời của nước Việt Nam Dân chủ cộng hòa...',
  '<p>Ngày 2/9/1945, tại Quảng trường Ba Đình, Hà Nội, Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập, tuyên bố trước quốc dân và thế giới sự ra đời của nước Việt Nam Dân chủ Cộng hòa — mở ra kỷ nguyên độc lập, tự do cho dân tộc Việt Nam.</p><p>Tuyên ngôn Độc lập là văn kiện lịch sử vô giá, kết tinh khát vọng độc lập, tự do của dân tộc, đồng thời khẳng định những giá trị phổ quát về quyền con người, quyền dân tộc: "Tất cả các dân tộc trên thế giới đều sinh ra bình đẳng, dân tộc nào cũng có quyền sống, quyền sung sướng và quyền tự do".</p><blockquote>"Không có gì quý hơn độc lập, tự do."<br><small>— Chủ tịch Hồ Chí Minh</small></blockquote><p>Hơn 80 năm qua, Tuyên ngôn Độc lập vẫn là ngọn đuốc soi đường, nguồn cổ vũ lớn lao để các thế hệ người Việt Nam, trong đó có thầy và trò Trường THPT Võ Trường Toản, phấn đấu học tập, rèn luyện, xây dựng và bảo vệ Tổ quốc.</p>',
  'published', 3120, '2026-09-02T07:16:00+07', '2026-09-02T07:16:00+07'
from public.categories c where c.slug = 'tin-tuc-khong-gian-van-hoa'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Lấy ý kiến Nhân dân đối với tác giả, công trình đề nghị xét tặng Giải thưởng Hồ Chí Minh về khoa học và công nghệ',
  'lay-y-kien-nhan-dan-giai-thuong-ho-chi-minh-khoa-hoc-cong-nghe',
  '(Hochiminhcity.gov.vn) - UBND TP. Hồ Chí Minh thông báo về việc lấy ý kiến Nhân dân đối với tác giả, công trình đề nghị xét tặng Giải thưởng Hồ Chí Minh về khoa học và công nghệ.',
  '<p>(Hochiminhcity.gov.vn) - UBND TP. Hồ Chí Minh thông báo về việc lấy ý kiến Nhân dân đối với tác giả, công trình đề nghị xét tặng Giải thưởng Hồ Chí Minh về khoa học và công nghệ theo quy định.</p><p>Giải thưởng Hồ Chí Minh là giải thưởng cao quý của Nhà nước, trao tặng các tác giả có công trình khoa học, công nghệ đặc biệt xuất sắc, có giá trị cao và ảnh hưởng lớn trong đời sống xã hội.</p><p>Ý kiến đóng góp của Nhân dân giúp hội đồng xét tặng đánh giá khách quan, toàn diện giá trị thực tiễn của từng công trình, bảo đảm việc trao tặng đúng người, đúng thành tựu.</p>',
  'published', 640, '2026-08-12T09:21:00+07', '2026-08-12T09:21:00+07'
from public.categories c where c.slug = 'hoc-va-lam-theo-loi-bac'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Tuyên dương "Thanh niên tiên tiến TP. Hồ Chí Minh làm theo lời Bác" lần thứ I, năm 2026',
  'tuyen-duong-thanh-nien-tien-tien-lam-theo-loi-bac-lan-thu-i-2026',
  '(Hochiminhcity.gov.vn) - Sáng 29/6, Thành Đoàn TP. Hồ Chí Minh tổ chức Chương trình tuyên dương "Thanh niên tiên tiến TP. Hồ Chí Minh làm theo lời Bác" lần thứ I, năm 2026.',
  '<p>(Hochiminhcity.gov.vn) - Sáng 29/6, tại Nhà Thiếu nhi TP. Hồ Chí Minh, Thành Đoàn TP. Hồ Chí Minh tổ chức Chương trình tuyên dương "Thanh niên tiên tiến TP. Hồ Chí Minh làm theo lời Bác" lần thứ I, năm 2026.</p><p>Các gương được tuyên dương là đoàn viên, thanh niên tiêu biểu trong học tập, lao động, nghiên cứu khoa học và hoạt động vì cộng đồng — là những bông hoa đẹp trong vườn hoa thi đua học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh của tuổi trẻ Thành phố.</p><p>Chương trình là dịp để tuổi trẻ các trường học, trong đó có học sinh Trường THPT Võ Trường Toản, nhìn lại mình và quyết tâm rèn luyện, phấn đấu xứng đáng là cháu ngoan Bác Hồ.</p>',
  'published', 1890, '2026-06-29T15:10:00+07', '2026-06-29T15:10:00+07'
from public.categories c where c.slug = 'hoc-va-lam-theo-loi-bac'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Tuyên dương gương thanh niên tiên tiến làm theo lời Bác',
  'tuyen-duong-guong-thanh-nien-tien-tien-lam-theo-loi-bac',
  '(Hochiminhcity.gov.vn) - Đoàn các cơ quan Đảng TP. Hồ Chí Minh tổ chức chương trình tuyên dương "Thanh niên tiên tiến làm theo lời Bác" năm 2026.',
  '<p>(Hochiminhcity.gov.vn) - Ngày 12/6, Đoàn các cơ quan Đảng TP. Hồ Chí Minh tổ chức chương trình tuyên dương "Thanh niên tiên tiến làm theo lời Bác" năm 2026.</p><p>Những gương mặt được vinh danh đều có điểm chung: lặng lẽ làm tốt từng việc nhỏ mỗi ngày — giúp đỡ bạn bè, tích cực hoạt động xã hội, không ngừng học hỏi — đúng với lời Bác dạy về đạo đức người cách mạng và tinh thần phục vụ Nhân dân.</p>',
  'published', 720, '2026-09-04T12:42:00+07', '2026-09-04T12:42:00+07'
from public.categories c where c.slug = 'hoc-va-lam-theo-loi-bac'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Đẩy mạnh học tập, thực hành tư tưởng, đạo đức, phương pháp, phong cách Hồ Chí Minh trong giai đoạn phát triển mới',
  'day-manh-hoc-tap-thuc-hanh-tu-tuong-dao-duc-ho-chi-minh-giai-doan-moi',
  'Chỉ thị số 07-CT/TW xác định việc học tập, thực hành theo Bác là nhiệm vụ trọng yếu, thường xuyên của cả hệ thống chính trị...',
  '<p>Chỉ thị số 07-CT/TW của Ban Bí thư xác định việc học tập, thực hành tư tưởng, đạo đức, phương pháp, phong cách Hồ Chí Minh là nhiệm vụ trọng yếu, thường xuyên của cả hệ thống chính trị trong giai đoạn phát triển mới.</p><p>Điểm nhấn quan trọng là chữ "thực hành": học Bác không chỉ dừng ở nhận thức, nghiên cứu lý luận, mà phải chuyển hóa thành hành động cụ thể, thành phong cách làm việc khoa học, gần dân, trọng dân, vì dân.</p><p>Đối với nhà trường, thực hành theo Bác thể hiện ở việc dạy tốt — học tốt, xây dựng môi trường giáo dục kỷ cương, thân thiện, lấy người học làm trung tâm.</p>',
  'published', 980, '2026-08-11T15:12:00+07', '2026-08-11T15:12:00+07'
from public.categories c where c.slug = 'tu-tuong-dao-duc'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Tư tưởng Hồ Chí Minh về đạo đức cách mạng: cần, kiệm, liêm, chính',
  'tu-tuong-ho-chi-minh-ve-dao-duc-cach-mang-can-kiem-liem-chinh',
  'Bốn đức tính cần, kiệm, liêm, chính là nền tảng đạo đức mà Chủ tịch Hồ Chí Minh căn dặn cán bộ, đảng viên và mỗi người dân rèn luyện suốt đời.',
  '<p>Trong tác phẩm "Sửa đổi lối làm việc" và nhiều bài viết khác, Chủ tịch Hồ Chí Minh khẳng định đạo đức là gốc của người cách mạng. Bốn đức tính cốt lõi Người căn dặn là: <strong>cần, kiệm, liêm, chính</strong>.</p><p><strong>Cần</strong> là siêng năng, chăm chỉ, làm việc có kế hoạch và hiệu quả. <strong>Kiệm</strong> là tiết kiệm sức lao động, thời giờ và tiền của của dân, của nước. <strong>Liêm</strong> là trong sạch, không tham ô, luôn tôn trọng của công. <strong>Chính</strong> là thẳng thắn, đứng đắn, không tà ý.</p><p>Với học sinh, rèn bốn đức tính ấy bắt đầu từ những việc rất gần: cần cù học tập, tiết kiệm thời gian và điện nước, trung thực trong thi cử, ngay thẳng với bạn bè — đó chính là học Bác từ những điều giản dị nhất.</p>',
  'published', 860, '2026-08-20T09:00:00+07', '2026-08-20T09:00:00+07'
from public.categories c where c.slug = 'tu-tuong-dao-duc'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Chủ tịch Hồ Chí Minh trong lòng bạn bè quốc tế',
  'chu-tich-ho-chi-minh-trong-long-ban-be-quoc-te',
  'Đối với nhân dân và bạn bè trên thế giới, Chủ tịch Hồ Chí Minh là lãnh tụ kiệt xuất, người chiến sĩ cộng sản lỗi lạc, người bạn thân thiết.',
  '<p>Đối với nhân dân và bạn bè trên thế giới, Chủ tịch Hồ Chí Minh là lãnh tụ kiệt xuất, người chiến sĩ cộng sản lỗi lạc, người bạn thân thiết. Cảm phục những cống hiến vĩ đại cho dân tộc, cho nhân loại, nhân dân và bạn bè trên thế giới đã ca ngợi Người với những lời tốt đẹp nhất.</p><p>Năm 1987, UNESCO ra nghị quyết vinh danh Chủ tịch Hồ Chí Minh là "Anh hùng giải phóng dân tộc, Nhà văn hóa kiệt xuất", khẳng định Người là biểu tượng của khát vọng độc lập, tự do và hòa bình của các dân tộc trên thế giới.</p><p>Tượng đài, quảng trường, con đường mang tên Hồ Chí Minh ở nhiều quốc gia là minh chứng sống động cho tình cảm và sự kính trọng mà bạn bè năm châu dành cho Người.</p>',
  'published', 1980, '2024-12-25T21:22:00+07', '2024-12-25T21:22:00+07'
from public.categories c where c.slug = 'hcm-va-the-gioi'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Chủ tịch Hồ Chí Minh qua lăng kính báo chí quốc tế',
  'chu-tich-ho-chi-minh-qua-lang-kinh-bao-chi-quoc-te',
  'Nhiều tờ báo lớn trên thế giới đã dành những trang viết trang trọng về Chủ tịch Hồ Chí Minh — con người giản dị mà vĩ đại.',
  '<p>Từ thập niên 1920, báo chí quốc tế đã chú ý đến Nguyễn Ái Quốc — người thanh niên Việt Nam hoạt động không mệt mỏi vì độc lập của các dân tộc thuộc địa.</p><p>Qua các thời kỳ, nhiều tờ báo lớn trên thế giới dành những trang viết trang trọng về Chủ tịch Hồ Chí Minh: một nhân cách lớn với lối sống vô cùng giản dị, một tư duy chiến lược sắc bén và một trái tim nhân ái bao la.</p><p>Những tư liệu báo chí ấy ngày nay là nguồn tham khảo quý cho việc giảng dạy và tìm hiểu về Bác trong nhà trường.</p>',
  'published', 540, '2024-12-25T21:20:00+07', '2024-12-25T21:20:00+07'
from public.categories c where c.slug = 'hcm-va-the-gioi'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Những công trình mang tên Chủ tịch Hồ Chí Minh trên thế giới',
  'nhung-cong-trinh-mang-ten-chu-tich-ho-chi-minh-tren-the-gioi',
  'Từ quảng trường, tượng đài đến trường học — hình ảnh và tên tuổi Hồ Chí Minh hiện diện ở nhiều quốc gia trên khắp các châu lục.',
  '<p>Trên khắp thế giới có hàng trăm công trình mang tên Chủ tịch Hồ Chí Minh: tượng đài tại quảng trường Hồ Chí Minh ở Mát-xcơ-va (Nga), tượng Bác tại thủ đô La Habana (Cu-ba), tại Antananarivo (Madagascar), các con đường, trường học mang tên Người ở Ấn Độ, Lào, Campuchia...</p><p>Mỗi công trình không chỉ là biểu tượng của tình hữu nghị giữa nhân dân Việt Nam với nhân dân các nước, mà còn là "địa chỉ đỏ" để bạn bè quốc tế và kiều bào tìm hiểu về lịch sử, văn hóa Việt Nam.</p>',
  'published', 610, '2024-12-25T21:18:00+07', '2024-12-25T21:18:00+07'
from public.categories c where c.slug = 'hcm-va-the-gioi'
on conflict (slug) do nothing;

insert into public.posts (category_id, title, slug, excerpt, content, status, views, published_at, created_at)
select c.id,
  'Bác Hồ với nước Nga (Phần 3)',
  'bac-ho-voi-nuoc-nga-phan-3',
  'Mối quan hệ đặc biệt giữa Chủ tịch Hồ Chí Minh với nước Nga — nơi Người tìm thấy con đường cứu nước và nhiều lần trở lại thăm.',
  '<p>Nước Nga — quê hương của Cách mạng Tháng Mười — có vị trí đặc biệt trong hành trình cứu nước của Chủ tịch Hồ Chí Minh. Chính từ Sơ thảo Luận cương của Lê-nin, Nguyễn Ái Quốc tìm thấy con đường giải phóng dân tộc.</p><p>Người nhiều lần đến nước Nga học tập, làm việc và sau này thăm chính thức trên cương vị Chủ tịch nước, đặt nền móng cho tình hữu nghị truyền thống Việt Nam — Liên Xô/Nga.</p><p>Phần 3 của loạt bài điểm lại những dấu mốc đáng nhớ trong các chuyến thăm, cùng những kỷ niệm sâu sắc mà nhân dân Nga dành cho Bác Hồ.</p>',
  'published', 1750, '2024-12-25T21:11:00+07', '2024-12-25T21:11:00+07'
from public.categories c where c.slug = 'hcm-va-the-gioi'
on conflict (slug) do nothing;

-- (Có thể bổ sung: 2 bài Tư tưởng nữa đang dùng lại ở trang chủ là có chủ đích —
--  trang chủ mục Tư tưởng hiển thị bài nổi bật của chuyên mục Tin tức trong
--  bản mẫu; website thật hiển thị đúng bài của chuyên mục Tư tưởng.)
