// Mục SÁCH LẬT trên trang Tin tức: bấm vào ô là mở sách toàn màn hình
// ngay trong tab mới (trang Heyzine), không qua khung xem giữa nữa.
const FLIP_URL = 'https://heyzine.com/flip-book/437b823c6d.html#page/1';

export default function FlipBookBox() {
  return (
    <div className="side-box">
      <h3 className="flip-head">
        SÁCH LẬT
        <br />
        <span className="flip-h2">KHÔNG GIAN VĂN HÓA HỒ CHÍ MINH</span>
      </h3>
      <a
        href={FLIP_URL}
        target="_blank"
        rel="noreferrer"
        className="ph-s flip-tile"
      >
        SÁCH LẬT
        <br />
        <span className="flip-t2">KHÔNG GIAN VĂN HÓA HỒ CHÍ MINH</span>
        <br />
        THPT VÕ TRƯỜNG TOẢN
        <br />
        <span className="flip-cta">Bấm để mở sách toàn màn hình</span>
      </a>
    </div>
  );
}
