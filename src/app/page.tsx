'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Applications</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Application Box */}
          <Link href="/create-agent">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="p-0">
                <CardTitle className="text-xl">Application 1</CardTitle>
                <CardDescription>
                  Click to create a new agent
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Second Application Box */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <CardTitle className="text-xl">Application 2</CardTitle>
              <CardDescription>
                Description for Application 2
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}