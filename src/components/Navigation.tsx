import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Floyd
            </Link>
          </div>
          
          <div className="flex space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Home
            </Link>
            <Link href="/realtime" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Realtime API Demo
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 