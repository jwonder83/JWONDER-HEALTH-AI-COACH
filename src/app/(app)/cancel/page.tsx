import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center text-apple-ink dark:text-zinc-100">
      <p className="font-display text-2xl font-bold tracking-tight">결제가 취소되었습니다</p>
      <p className="mt-4 text-[15px] text-apple-subtle dark:text-zinc-400">언제든지 다시 시도할 수 있어요.</p>
      <Link href="/settings" className="mt-10 inline-block text-[15px] font-semibold underline underline-offset-4">
        설정으로
      </Link>
    </div>
  );
}
