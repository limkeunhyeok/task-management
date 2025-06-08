// 주 용도는 teams 메시지 보낼 때, string으로 변환
export function convertToStringRecord<T extends Record<string, unknown>>(
  obj: T,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      let strValue = '';

      if (value instanceof Date) {
        strValue = value.toISOString();
      } else {
        strValue = String(value);
      }

      return [key, strValue];
    }),
  );
}
