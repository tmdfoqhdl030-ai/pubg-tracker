// 텔레메트리 카드 로딩 스켈레톤

export default function TelemetrySkeleton({ title, height = 200 }: { title: string; height?: number }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden animate-pulse" style={{ border: "1px solid #E2E8F0" }}>
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid #F1F5F9" }}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#E2E8F0" }} />
          <div className="w-28 h-4 rounded" style={{ backgroundColor: "#E2E8F0" }} />
        </div>
        <div className="w-16 h-4 rounded" style={{ backgroundColor: "#E2E8F0" }} />
      </div>
      <div className="px-5 py-4 space-y-3">
        <div className="w-full rounded" style={{ height, backgroundColor: "#F8FAFC" }}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full mx-auto mb-2 border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#E2E8F0", borderTopColor: "#94A3B8" }} />
              <p className="text-xs" style={{ color: "#94A3B8" }}>{title} 분석 중...</p>
              <p className="text-[10px] mt-1" style={{ color: "#CBD5E1" }}>텔레메트리 데이터 처리 중 (최대 30초)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
