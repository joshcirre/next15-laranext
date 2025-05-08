import { BookmarkForm } from "@/components/BookmarkForm";
import { GenerateForm } from "@/components/GenerateForm";
import { cookies } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Bookmark = {
  id: number;
  url: string;
  title?: string;
  created_at: string;
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("apiToken")?.value;

  let bookmarks: Bookmark[] = [];
  let error = null;

  if (token) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookmarks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        next: {
          revalidate: 0 // Don't cache this request
        },
      });

      if (res.ok) {
        bookmarks = await res.json();
      } else {
        error = `Failed to fetch bookmarks: ${res.status} ${res.statusText}`;
        console.error("API Response:", await res.text().catch(() => "Could not read response text"));
      }
    } catch (e) {
      error = "An error occurred while fetching bookmarks";
      console.error(e);
    }
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-6xl px-4 sm:px-6 py-10 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          {token && (
            <Link href="/sanctum">
              <Button variant="outline">Back to Login</Button>
            </Link>
          )}
        </div>

        {!token ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You need an API token to access this dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You&apos;re not currently authenticated. Please generate a token or return to the login page.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <GenerateForm />
                <Link href="/sanctum">
                  <Button variant="outline">Go to Login</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <BookmarkForm />
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Your Bookmarks</CardTitle>
                <CardDescription>
                  All your saved bookmarks are listed below
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <p className="text-red-500 mb-4">{error}</p>
                )}

                {bookmarks.length === 0 ? (
                  <p className="text-muted-foreground py-4">
                    You haven&apos;t added any bookmarks yet. Add your first one!
                  </p>
                ) : (
                  <ul className="divide-y">
                    {bookmarks.map((bookmark) => (
                      <li key={bookmark.id} className="py-3">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all font-medium"
                        >
                          {bookmark.title || bookmark.url}
                        </a>
                        {bookmark.title && (
                          <p className="text-sm text-gray-600 mt-1 break-all">
                            {bookmark.url}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Added on {new Date(bookmark.created_at).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
