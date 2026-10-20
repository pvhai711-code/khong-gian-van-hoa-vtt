// Ghi nhật ký thao tác (bảng audit_logs) — dùng với browser client
// trong khu vực Admin. Lỗi ghi log không được làm hỏng thao tác chính.
export async function writeAudit(supabase, userId, action, detail) {
  try {
    if (!userId) return;
    await supabase.from('audit_logs').insert({
      actor_id: userId,
      action,
      detail: detail || null,
    });
  } catch {
    // bỏ qua
  }
}
