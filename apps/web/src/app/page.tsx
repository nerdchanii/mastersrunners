export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[100svh] max-h-[100dvh] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start justify-center relative">
        <div className="absolute inset-0 "></div>
        <h1 className="text-4xl font-bold text-center w-full">
          마스터즈 러너스
        </h1>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl font-semibold">
            현재 서비스 준비 중입니다 🔨
          </h2>
          <p className="text-gray-600 max-w-md">
            훈련일지 기반 러닝 커뮤니티 서비스가 찾아옵니다.
            <br />
            조금만 기다려주세요!
          </p>
        </div>
      </main>
    </div>
  );
}
