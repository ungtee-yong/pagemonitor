const EmptyState = ({ onRefresh }) => (
  <div className="empty-state">
    <p>ยังไม่มีคอมเมนต์ใหม่ในช่วงเวลานี้</p>
    <button type="button" className="primary" onClick={onRefresh}>
      ดึงข้อมูลล่าสุด
    </button>
  </div>
);

export default EmptyState;
