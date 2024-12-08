import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">AI-Assisted Story Writing App for Kids</h1>
        <p className="text-xl">Create amazing stories with the help of AI!</p>
        <Link href="/story-writer" className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-600 transition-colors">
          Start Writing
        </Link>
      </main>
      {/* ... (keep the existing footer) */}
    </div>
  );
}