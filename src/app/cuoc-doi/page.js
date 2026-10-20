import Link from 'next/link';
import { getTimelineEvents, getSettings } from '../../lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title:
    'Cuộc đời, sự nghiệp Hồ Chí Minh — Không gian văn hóa Hồ Chí Minh',
};

export default async function CuocDoiPage() {
  const [events, settings] = await Promise.all([
    getTimelineEvents(),
    getSettings(),
  ]);
  const portraitUrl = settings.raw?.portrait?.url || '/chan-dung-bac.png';

  return (
    <main>
      <section className="sec wrap" style={{ paddingTop: 22 }}>
        <div className="crumb">
          <Link href="/">Trang chủ</Link> / <b>Cuộc đời, sự nghiệp</b>
        </div>
        <div className="intro-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={portraitUrl} alt="Chân dung Chủ tịch Hồ Chí Minh" />
          <div>
            <h2>
              Cuộc đời, sự nghiệp
              <br />
              HỒ CHÍ MINH (1890 - 1969)
            </h2>
            <p>
              Chủ tịch Hồ Chí Minh — vị lãnh tụ thiên tài của Đảng và Nhân dân
              ta, người thầy vĩ đại của cách mạng Việt Nam, Anh hùng giải
              phóng dân tộc, Nhà văn hóa kiệt xuất. Cuộc đời của Người là tấm
              gương sáng về tinh thần yêu nước, ý chí tự lực tự cường và đức
              hy sinh vì độc lập, tự do của dân tộc.
            </p>
          </div>
        </div>

        {events.length > 0 ? (
          <div className="tl">
            {events.map((ev) => (
              <div className="tl-item" key={ev.id}>
                <div className="tl-year">{ev.period_label}</div>
                <div className="tl-dot"></div>
                <div className="tl-body">
                  <h4>{ev.title}</h4>
                  {ev.body && <p>{ev.body}</p>}
                  {ev.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ev.image_url}
                      alt={ev.title}
                      style={{
                        maxWidth: 420,
                        width: '100%',
                        borderRadius: 10,
                        marginTop: 8,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="note-line">
            Các mốc thời gian sẽ hiện tại đây (dữ liệu nằm trong bảng Mốc thời
            gian, Admin chỉnh sửa được).
          </p>
        )}
      </section>
    </main>
  );
}
