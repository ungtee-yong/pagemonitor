import Avatar from './Avatar';

const PageSidebar = ({ pages, selectedPageId, onSelect, loading, onRefresh }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div>
          <p className="eyebrow">Fan Page</p>
          <h2>จัดการคอมเมนต์</h2>
        </div>
        <button
          className="ghost-button"
          type="button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
        </button>
      </div>

      <div className="sidebar__body">
        {loading && !pages.length ? (
          <div className="empty-state">กำลังโหลดข้อมูลเพจ...</div>
        ) : pages.length ? (
          <ul className="sidebar__list">
            {pages.map((page) => {
              const isActive = page.id === selectedPageId;
              return (
                <li
                  key={page.id}
                  className={`sidebar__item ${isActive ? 'is-active' : ''}`}
                >
                  <button type="button" onClick={() => onSelect(page.id)}>
                    <Avatar src={page.picture} name={page.name} size={44} />
                    <div>
                      <p className="sidebar__item-title">{page.name}</p>
                      <span className="sidebar__item-subtitle">Page ID: {page.id}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-state">
            <p>ยังไม่มีเพจที่อนุมัติสิทธิ์ให้เชื่อมต่อ</p>
            <p className="muted">ตรวจสอบโทเคนของคุณ แล้วกดรีเฟรชอีกครั้ง</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default PageSidebar;
