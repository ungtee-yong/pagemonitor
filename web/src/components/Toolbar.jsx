const LIMIT_OPTIONS = [5, 10, 20, 50];

const Toolbar = ({
  limit,
  onLimitChange,
  autoRefresh,
  onToggleAutoRefresh,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <section className="toolbar">
      <div className="toolbar-group">
        <label className="toolbar-label">
          โพสต์ล่าสุด
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {LIMIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} โพสต์
              </option>
            ))}
          </select>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(event) => onToggleAutoRefresh(event.target.checked)}
          />
          <span>รีเฟรชอัตโนมัติทุก 1 นาที</span>
        </label>
      </div>
      <button
        type="button"
        className="primary"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? 'กำลังรีเฟรช...' : 'รีเฟรชตอนนี้'}
      </button>
    </section>
  );
};

export default Toolbar;
