const colors: Record<string, { bg: string; color: string }> = {
  INCOMPLET: { bg: '#ffebee', color: '#c62828' },
  EN_COURS:  { bg: '#fff3e0', color: '#e65100' },
  VALIDE:    { bg: '#e8f5e9', color: '#2e7d32' },
  ARCHIVE:   { bg: '#eeeeee', color: '#616161' },
  ADMIS:     { bg: '#e8f5e9', color: '#2e7d32' },
  AJOURNE:   { bg: '#fff3e0', color: '#e65100' },
  ABSENT:    { bg: '#ffebee', color: '#c62828' },
  CODE:      { bg: '#e3f2fd', color: '#1565c0' },
  CRENEAU:   { bg: '#f3e5f5', color: '#6a1b9a' },
  CONDUITE:  { bg: '#e0f7fa', color: '#006064' },
};

export default function Badge({ value }: { value: string }) {
  const style = colors[value] ?? { bg: '#e0e0e0', color: '#333' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                   fontSize: 11, fontWeight: 600, background: style.bg, color: style.color }}>
      {value}
    </span>
  );
}
